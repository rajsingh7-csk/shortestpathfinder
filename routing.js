// Dijkstra's State-Space Pathfinding Engine for Indian Railways
// Supports 4 optimization criteria: Fastest, Shortest, Cheapest, and Fewest Transfers.
// Computes schedules, transfers, layover times, and multi-day travels.

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to parse Day + HH:MM into absolute minutes in a week
function parseTimeToMin(dayStr, timeStr) {
  const dayIdx = DAYS.indexOf(dayStr);
  const [h, m] = timeStr.split(":").map(Number);
  return dayIdx * 24 * 60 + h * 60 + m;
}

// Helper to format absolute minutes back to "Day HH:MM"
function minToTimeStr(min) {
  const dayIdx = Math.floor(min / (24 * 60)) % 7;
  const dayStr = DAYS[dayIdx];
  const totalMins = min % (24 * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${dayStr} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Helper to format duration in minutes to "Xh Ym"
function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Automatically build bidirectional graph from CONNECTIONS
function buildAdjacencyList() {
  const adj = {};
  
  // Ensure all stations are initialized in adjacency list
  for (const code in STATIONS) {
    adj[code] = [];
  }
  
  CONNECTIONS.forEach(conn => {
    const from = conn.from;
    const to = conn.to;
    const distance = conn.distance;
    
    // Add forward connection
    adj[from].push({
      to: to,
      distance: distance,
      trains: conn.trains.map(t => ({ ...t, isReverse: false }))
    });
    
    // Create and add reverse connection (Down -> Up)
    const reverseTrains = conn.trains.map(t => {
      // Reverse train number (e.g. 12952 -> 12951)
      const numVal = parseInt(t.id);
      let revId = t.id;
      if (!isNaN(numVal)) {
        revId = String(numVal % 2 === 0 ? numVal - 1 : numVal + 1);
      }
      
      // Mirror arrival/departure for simplicity while keeping duration and fares identical
      return {
        id: revId,
        name: t.name + " (Return)",
        type: t.type,
        depTime: t.depTime,
        arrTime: t.arrTime,
        duration: t.duration,
        days: t.days,
        fares: t.fares,
        isReverse: true
      };
    });
    
    adj[to].push({
      to: from,
      distance: distance,
      trains: reverseTrains
    });
  });
  
  return adj;
}

// Priority Queue for Dijkstra
class PriorityQueue {
  constructor() {
    this.values = [];
  }
  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }
  dequeue() {
    return this.values.shift();
  }
  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }
  isEmpty() {
    return this.values.length === 0;
  }
}

// Calculate the absolute weekly minutes for the next departure of a train
function getNextDeparture(currTime, trainDays, depTimeStr) {
  const [h, m] = depTimeStr.split(":").map(Number);
  const depTimeOfDay = h * 60 + m;
  
  const currDayIdx = Math.floor(currTime / (24 * 60)) % 7;
  
  // Look ahead day by day, up to 7 days
  for (let i = 0; i < 8; i++) {
    const checkDayIdx = (currDayIdx + i) % 7;
    const checkDayName = DAYS[checkDayIdx];
    
    if (trainDays.includes(checkDayName)) {
      // Calculate departure time in minutes from Monday 00:00
      // We take the current week offset, add day index difference
      const dayOffsetMins = Math.floor(currTime / (24 * 60) + i) * 24 * 60;
      const depTimeInWeek = dayOffsetMins + depTimeOfDay;
      
      // If we are checking "today" (i = 0), we must ensure we depart after currTime + min layover time (15 mins)
      // Otherwise, we take the departure in the next week or future days.
      if (i === 0 && depTimeInWeek < currTime + 15) {
        continue;
      }
      return depTimeInWeek;
    }
  }
  // Fallback: search subsequent week if needed (highly unlikely to be needed but safe)
  return currTime + 7 * 24 * 60;
}

// Run State-Space Dijkstra Algorithm
// criteria: "fastest" | "shortest" | "cheapest" | "transfers"
// selectedClass: "SL" | "3A" | "2A" | "1A"
function findOptimalRoute(source, destination, criteria, selectedClass, startDay = "Mon", startTimeStr = "08:00") {
  const adj = buildAdjacencyList();
  
  if (!STATIONS[source] || !STATIONS[destination]) {
    return { error: "Invalid source or destination station." };
  }
  
  const startTime = parseTimeToMin(startDay, startTimeStr);
  
  // Dijkstra states tracked by a key: "stationCode_activeTrainId"
  // start state has activeTrainId = "BOARDING"
  const pq = new PriorityQueue();
  const dist = {}; // Tracks minimum accumulated weight for each state
  const stateData = {}; // Tracks { time, distance, fare, transfers, parentStateKey, activeTrain }
  
  const startStateKey = `${source}_BOARDING`;
  dist[startStateKey] = 0;
  stateData[startStateKey] = {
    station: source,
    trainId: "BOARDING",
    time: startTime,
    distance: 0,
    fare: 0,
    transfers: 0,
    parentKey: null,
    activeTrain: null
  };
  
  pq.enqueue(startStateKey, 0);
  
  let bestDestinationStateKey = null;
  let minDestWeight = Infinity;
  
  while (!pq.isEmpty()) {
    const { val: currKey } = pq.dequeue();
    const curr = stateData[currKey];
    
    if (!curr) continue;
    
    const currWeight = dist[currKey];
    
    // If we reached destination, record if it's the absolute best weight
    if (curr.station === destination) {
      if (currWeight < minDestWeight) {
        minDestWeight = currWeight;
        bestDestinationStateKey = currKey;
      }
      // Since Dijkstra guarantees shortest paths, we can stop if we are doing single-criteria,
      // but in transit we can keep searching a bit to see if we find better schedules.
      // For performance, stopping at the first popped destination state is correct for Dijkstra.
      break;
    }
    
    // Prune paths that are already worse than the best found destination path
    if (currWeight > minDestWeight) continue;
    
    // Explore adjacent stations
    const connections = adj[curr.station] || [];
    for (const conn of connections) {
      const neighbor = conn.to;
      const segmentDistance = conn.distance;
      
      // Filter trains that support the selected coach class (must have a fare)
      const validTrains = conn.trains.filter(t => t.fares[selectedClass] !== null && t.fares[selectedClass] !== undefined);
      
      for (const train of validTrains) {
        let waitTime = 0;
        let depTime = 0;
        let arrTime = 0;
        let isTransfer = false;
        
        // 1. Calculate time, transfers, and wait times
        if (curr.trainId === train.id) {
          // No transfer, stay on the train!
          // The train departs immediately (duration is segment-specific)
          isTransfer = false;
          depTime = curr.time; // Continuation is instant
          arrTime = curr.time + train.duration;
        } else {
          // Transfer required (either boarding at start or switching trains)
          isTransfer = true;
          depTime = getNextDeparture(curr.time, train.days, train.depTime);
          waitTime = depTime - curr.time;
          arrTime = depTime + train.duration;
        }
        
        const segmentFare = train.fares[selectedClass];
        
        // 2. Accumulate values
        const nextTime = arrTime;
        const nextDistance = curr.distance + segmentDistance;
        const nextFare = curr.fare + segmentFare;
        const nextTransfers = curr.transfers + (isTransfer && curr.trainId !== "BOARDING" ? 1 : 0);
        
        // 3. Compute cost/weight based on criteria
        let weightIncrement = 0;
        switch (criteria) {
          case "fastest":
            // Cost is elapsed time (wait time + travel time)
            weightIncrement = waitTime + train.duration;
            break;
          case "shortest":
            // Cost is physical distance
            weightIncrement = segmentDistance;
            break;
          case "cheapest":
            // Cost is ticket fare
            weightIncrement = segmentFare;
            break;
          case "transfers":
            // Cost is number of transfers (with a tiny distance tie-breaker to prefer faster/shorter paths)
            weightIncrement = (isTransfer && curr.trainId !== "BOARDING" ? 100000 : 0) + (waitTime + train.duration);
            break;
        }
        
        const nextWeight = currWeight + weightIncrement;
        const nextStateKey = `${neighbor}_${train.id}`;
        
        // 4. Relax Edge
        if (dist[nextStateKey] === undefined || nextWeight < dist[nextStateKey]) {
          dist[nextStateKey] = nextWeight;
          stateData[nextStateKey] = {
            station: neighbor,
            trainId: train.id,
            time: nextTime,
            distance: nextDistance,
            fare: nextFare,
            transfers: nextTransfers,
            parentKey: currKey,
            activeTrain: train,
            depTime: depTime,
            arrTime: arrTime,
            waitTime: waitTime
          };
          pq.enqueue(nextStateKey, nextWeight);
        }
      }
    }
  }
  
  if (!bestDestinationStateKey) {
    return { error: `No route found from ${source} to ${destination} using ${selectedClass} class.` };
  }
  
  // Backtrack to build the itinerary path
  const pathStates = [];
  let currKey = bestDestinationStateKey;
  while (currKey !== null) {
    pathStates.push(stateData[currKey]);
    currKey = stateData[currKey].parentKey;
  }
  pathStates.reverse();
  
  // Format itinerary details into user-friendly steps
  const itinerary = [];
  let totalWaitTime = 0;
  
  for (let i = 1; i < pathStates.length; i++) {
    const step = pathStates[i];
    const prevStep = pathStates[i - 1];
    
    totalWaitTime += step.waitTime;
    
    itinerary.push({
      from: prevStep.station,
      fromName: STATIONS[prevStep.station].name,
      to: step.station,
      toName: STATIONS[step.station].name,
      trainId: step.activeTrain.id,
      trainName: step.activeTrain.name,
      trainType: step.activeTrain.type,
      depTime: minToTimeStr(step.depTime),
      arrTime: minToTimeStr(step.arrTime),
      duration: formatDuration(step.activeTrain.duration),
      distance: CONNECTIONS.find(c => (c.from === prevStep.station && c.to === step.station) || (c.from === step.station && c.to === prevStep.station)).distance,
      fare: step.activeTrain.fares[selectedClass],
      layover: step.waitTime > 0 && prevStep.trainId !== "BOARDING" ? formatDuration(step.waitTime) : null
    });
  }
  
  const destData = stateData[bestDestinationStateKey];
  return {
    source: source,
    sourceName: STATIONS[source].name,
    destination: destination,
    destinationName: STATIONS[destination].name,
    criteria: criteria,
    selectedClass: selectedClass,
    totalDurationStr: formatDuration(destData.time - startTime),
    totalDurationMin: destData.time - startTime,
    totalDistance: destData.distance,
    totalFare: destData.fare,
    numTransfers: destData.transfers,
    startTimeStr: minToTimeStr(startTime),
    endTimeStr: minToTimeStr(destData.time),
    itinerary: itinerary
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { findOptimalRoute, minToTimeStr, formatDuration };
}
