import heapq
from flask import Flask, jsonify, request
from copy import deepcopy

app = Flask(__name__)

# ---------------- PREDEFINED DATA ----------------
PREDEFINED_LOCATIONS = ["A", "B", "C", "D", "E", "F", "R1", "R2"]
PREDEFINED_ROADS = [
    ("R1", "A", 2),
    ("A", "B", 2),
    ("B", "C", 2),
    ("C", "D", 2),
    ("D", "E", 2),
    ("E", "F", 2),
    ("F", "R2", 2),
    ("R1", "C", 4),
    ("R2", "D", 3),
    ("B", "E", 3)
]
PREDEFINED_AGENTS = [
    {"id": "A1", "restaurant": "R1"},
    {"id": "A2", "restaurant": "R2"}
]
PREDEFINED_ORDERS = [
    {"id": 1, "customer": "A", "restaurant": "R1"},
    {"id": 2, "customer": "F", "restaurant": "R1"},
    {"id": 3, "customer": "D", "restaurant": "R2"},
    {"id": 4, "customer": "B", "restaurant": "R2"}
]

# ---------------- DIJKSTRA ----------------
def dijkstra(graph, start):
    pq = [(0, start)]
    dist = {node: float('inf') for node in graph}
    prev = {node: None for node in graph}
    dist[start] = 0

    while pq:
        d, node = heapq.heappop(pq)
        
        if d > dist[node]: continue

        for nei, wt in graph[node]:
            if dist[nei] > d + wt:
                dist[nei] = d + wt
                prev[nei] = node
                heapq.heappush(pq, (dist[nei], nei))

    return dist, prev

def get_path(prev_map, start, end):
    path = []
    curr = end
    while curr is not None:
        path.append(curr)
        if curr == start: break
        curr = prev_map[start].get(curr, None)
    return path[::-1]

def run_optimization(locations, roads, agents_input, orders_input):
    graph = {loc: [] for loc in locations}
    for u, v, w in roads:
        graph[u].append((v, w))
        graph[v].append((u, w))

    # PRECOMPUTE
    dist_all = {}
    prev_all = {}
    for loc in graph:
        d_map, p_map = dijkstra(graph, loc)
        dist_all[loc] = d_map
        prev_all[loc] = p_map

    def get_full_route(agent, order):
        r = order['restaurant']
        c = order['customer']
        route1 = get_path(prev_all, agent["restaurant"], r)
        route2 = get_path(prev_all, r, c)
        if route1 and route2:
            return route1[:-1] + route2
        return route1 or route2

    def delivery_cost(agent, order):
        r = order['restaurant']
        c = order['customer']
        return dist_all[agent["restaurant"]][r] + dist_all[r][c]

    def busy_time(agent, order):
        r = order['restaurant']
        c = order['customer']
        return (dist_all[agent["restaurant"]][r] +
                dist_all[r][c] +
                dist_all[c][agent["restaurant"]])

    # ---------------- FCFS ----------------
    def fcfs():
        agent_time = {a["id"]: 0 for a in agents_input}
        assignment = []

        for order in orders_input:
            agent_id = min(agent_time, key=agent_time.get)
            agent = next(a for a in agents_input if a["id"] == agent_id)

            cost = delivery_cost(agent, order)
            btime = busy_time(agent, order)
            route = get_full_route(agent, order)

            assignment.append({"orderId": order["id"], "agentId": agent_id, "cost": cost, "route": route})
            agent_time[agent_id] += btime

        return assignment

    def total_cost(assign):
        return sum(x["cost"] for x in assign)

    # ---------------- DP (FIXED) ----------------
    memo = {}

    def dp(i, agent_time):
        if i == len(orders_input):
            return 0

        key = (i, tuple(sorted(agent_time.items())))
        if key in memo:
            return memo[key]

        ans = float('inf')

        for agent in agents_input:
            aid = agent["id"]

            cost = delivery_cost(agent, orders_input[i])
            btime = busy_time(agent, orders_input[i])

            new_agent_time = agent_time.copy()
            new_agent_time[aid] += btime

            total = cost + dp(i + 1, new_agent_time)
            ans = min(ans, total)

        memo[key] = ans
        return ans

    def dp_assign(i, agent_time):
        if i == len(orders_input):
            return []

        best = float('inf')
        best_choice = None

        for agent in agents_input:
            aid = agent["id"]

            cost = delivery_cost(agent, orders_input[i])
            btime = busy_time(agent, orders_input[i])

            new_agent_time = agent_time.copy()
            new_agent_time[aid] += btime

            total = cost + dp(i + 1, new_agent_time)

            if total < best:
                best = total
                route = get_full_route(agent, orders_input[i])
                best_choice = (aid, cost, new_agent_time, route)

        aid, cost, new_agent_time, route = best_choice
        return [{"orderId": orders_input[i]["id"], "agentId": aid, "cost": cost, "route": route}] + dp_assign(i + 1, new_agent_time)

    # ---------------- BACKTRACKING (FIXED) ----------------
    best_bt = float('inf')
    best_bt_assign = []

    def backtrack(i, agent_time, current, assign):
        nonlocal best_bt, best_bt_assign

        if i == len(orders_input):
            if current < best_bt:
                best_bt = current
                best_bt_assign = deepcopy(assign)
            return

        for agent in agents_input:
            aid = agent["id"]

            cost = delivery_cost(agent, orders_input[i])
            btime = busy_time(agent, orders_input[i])

            new_agent_time = agent_time.copy()
            new_agent_time[aid] += btime

            route = get_full_route(agent, orders_input[i])
            assign.append({"orderId": orders_input[i]["id"], "agentId": aid, "cost": cost, "route": route})
            backtrack(
                i + 1,
                new_agent_time,
                current + cost,
                assign
            )
            assign.pop()

    # RUN
    fcfs_res = fcfs()
    fcfs_total = total_cost(fcfs_res)

    memo.clear()
    init_agent_time = {a["id"]: 0 for a in agents_input}
    dp_res = dp_assign(0, init_agent_time)
    dp_total = sum(x["cost"] for x in dp_res) 
    
    init_agent_time = {a["id"]: 0 for a in agents_input}
    backtrack(0, init_agent_time, 0, [])
    
    return {
        "fcfs": {"assignment": fcfs_res, "totalCost": fcfs_total},
        "dp": {"assignment": dp_res, "totalCost": dp_total},
        "backtracking": {"assignment": best_bt_assign, "totalCost": best_bt}
    }


@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({
        "locations": PREDEFINED_LOCATIONS,
        "roads": PREDEFINED_ROADS,
        "agents": PREDEFINED_AGENTS,
        "orders": PREDEFINED_ORDERS
    })

@app.route('/api/optimize', methods=['POST'])
def optimize():
    data = request.json or {}
    locations = data.get("locations", PREDEFINED_LOCATIONS)
    roads = data.get("roads", PREDEFINED_ROADS)
    agents = data.get("agents", PREDEFINED_AGENTS)
    orders = data.get("orders", PREDEFINED_ORDERS)
    
    try:
        results = run_optimization(locations, roads, agents, orders)
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
