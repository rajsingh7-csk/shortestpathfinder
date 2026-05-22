// App Controller - Indian Railway Route Finder
// Integrates SVG Map rendering, zoom/pan controls, UI state sync, and path calculations.
// Mobile-optimized with touch support and responsive interactions.

// State variables
let currentSource = "";
let currentDestination = "";
let currentCriteria = "fastest";
let currentClass = "3A";
let activeRoute = null;

// Zoom and Pan state
let panX = 0;
let panY = 0;
let zoomScale = 1.0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;
let lastDistance = 0; // for pinch zoom

// Mobile detection
const isMobile = () => window.innerWidth <= 768;
const isSmallMobile = () => window.innerWidth <= 480;

// Coordinate Projection: Maps Lat/Lon to SVG (800x900) coordinates
// Boundaries adjusted to fit the geometric shape of India
function project(lat, lon) {
  const lonMin = 67.5;
  const lonMax = 97.0;
  const latMin = 6.5;
  const latMax = 35.5;
  
  // Linear scale with padding
  const x = 50 + ((lon - lonMin) / (lonMax - lonMin)) * 700;
  const y = 850 - ((lat - latMin) / (latMax - latMin)) * 800;
  return { x, y };
}

// Get touch distance for pinch zoom
function getTouchDistance(e) {
  if (e.touches.length < 2) return 0;
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  populateDropdowns();
  setupCriteriaSelectors();
  setupClassSelectors();
  setupPresets();
  renderSVGMap();
  setupMapInteraction();
  setupFormHandler();
  setupTouchHandlers();
  
  // Set default initial values
  setSearchState("NDLS", "MMCT", "fastest", "3A");
  if (!isMobile()) {
    calculateJourney();
  }
  
  // Handle window resize for responsive adjustments
  window.addEventListener('resize', handleWindowResize);
});

function handleWindowResize() {
  const mapLayers = document.getElementById('map-layers');
  if (mapLayers && isMobile() && zoomScale > 1.5) {
    // Auto-reset zoom on mobile when resizing
    panX = 0;
    panY = 0;
    zoomScale = 1.0;
    applyTransform();
  }
}

// Populate Dropdown inputs with sorted station lists
function populateDropdowns() {
  const sourceSelect = document.getElementById("source-select");
  const destSelect = document.getElementById("dest-select");
  
  // Sort stations alphabetically by City Name
  const sortedStations = Object.values(STATIONS).sort((a, b) => a.city.localeCompare(b.city));
  
  sortedStations.forEach(s => {
    const opt1 = document.createElement("option");
    opt1.value = s.code;
    opt1.textContent = `${s.city} (${s.code}) - ${s.name}`;
    sourceSelect.appendChild(opt1);
    
    const opt2 = document.createElement("option");
    opt2.value = s.code;
    opt2.textContent = `${s.city} (${s.code}) - ${s.name}`;
    destSelect.appendChild(opt2);
  });
  
  // Sync dropdown change events back to state and pulse animations
  sourceSelect.addEventListener("change", (e) => {
    currentSource = e.target.value;
    updatePulseRings();
    clearActiveRoute();
  });
  
  destSelect.addEventListener("change", (e) => {
    currentDestination = e.target.value;
    updatePulseRings();
    clearActiveRoute();
  });
}

// Setup Criteria Grid buttons
function setupCriteriaSelectors() {
  const options = document.querySelectorAll(".criteria-option");
  options.forEach(opt => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      currentCriteria = opt.dataset.criteria;
      // Recalculate instantly if path is active
      if (currentSource && currentDestination) {
        calculateJourney();
      }
    });
  });
}

// Setup Class Selector buttons
function setupClassSelectors() {
  const options = document.querySelectorAll(".class-option");
  options.forEach(opt => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      currentClass = opt.dataset.class;
      // Recalculate instantly if path is active
      if (currentSource && currentDestination) {
        calculateJourney();
      }
    });
  });
}

// Render geographical background grids and networks onto SVG
function renderSVGMap() {
  const bgGrid = document.getElementById("bg-grid");
  const edgesGroup = document.getElementById("edges-group");
  const nodesGroup = document.getElementById("nodes-group");
  
  // 1. Draw a technical background grid
  let gridContent = "";
  const gridStep = isMobile() ? 100 : 50;
  for (let i = gridStep; i < 800; i += gridStep) {
    gridContent += `<line x1="${i}" y1="0" x2="${i}" y2="900" class="map-bg-grid"></line>`;
  }
  for (let j = gridStep; j < 900; j += gridStep) {
    gridContent += `<line x1="0" y1="${j}" x2="800" y2="${j}" class="map-bg-grid"></line>`;
  }
  bgGrid.innerHTML = gridContent;
  
  // 2. Render Edges (Railway Track Connections)
  let edgesContent = "";
  CONNECTIONS.forEach((conn, index) => {
    const fromCoord = project(STATIONS[conn.from].lat, STATIONS[conn.from].lon);
    const toCoord = project(STATIONS[conn.to].lat, STATIONS[conn.to].lon);
    
    // Draw base track, glow track, and animated pulsing overlays
    edgesContent += `
      <g id="segment-${conn.from}-${conn.to}">
        <line x1="${fromCoord.x}" y1="${fromCoord.y}" x2="${toCoord.x}" y2="${toCoord.y}" 
              class="edge" id="edge-${conn.from}-${conn.to}"></line>
        <line x1="${fromCoord.x}" y1="${fromCoord.y}" x2="${toCoord.x}" y2="${toCoord.y}" 
              class="edge-glow-animated" id="edge-anim-${conn.from}-${conn.to}"></line>
      </g>
    `;
  });
  edgesGroup.innerHTML = edgesContent;
  
  // 3. Render Station Nodes & Floating Labels
  let nodesContent = "";
  for (const code in STATIONS) {
    const s = STATIONS[code];
    const coord = project(s.lat, s.lon);
    
    nodesContent += `
      <g class="node-group" id="node-group-${s.code}">
        <circle cx="${coord.x}" cy="${coord.y}" r="6.5" 
                class="node" id="node-${s.code}" data-code="${s.code}"></circle>
        <text x="${coord.x + 10}" y="${coord.y + 4}" 
              class="node-label" id="label-${s.code}">${s.city}</text>
      </g>
    `;
  }
  nodesGroup.innerHTML = nodesContent;
}

// Setup panning, zooming, hover tooltips, and click-to-select handlers
function setupMapInteraction() {
  const mapContainer = document.getElementById("map-container");
  const mapSvg = document.getElementById("map-svg");
  const nodes = document.querySelectorAll(".node");
  const tooltip = document.getElementById("map-tooltip");
  
  // Group elements to be scaled/panned together
  let mapLayers = document.getElementById('map-layers');
  if (!mapLayers) {
    mapLayers = document.createElementNS("http://www.w3.org/2000/svg", "g");
    mapLayers.id = "map-layers";

    // Move edges, grid, pulsing rings, and nodes inside this single parent group
    const bgGrid = document.getElementById("bg-grid");
    const edgesGroup = document.getElementById("edges-group");
    const pulseSrc = document.getElementById("pulse-source");
    const pulseDst = document.getElementById("pulse-dest");
    const nodesGroup = document.getElementById("nodes-group");
    
    mapSvg.appendChild(mapLayers);
    mapLayers.appendChild(bgGrid);
    mapLayers.appendChild(edgesGroup);
    mapLayers.appendChild(pulseSrc);
    mapLayers.appendChild(pulseDst);
    mapLayers.appendChild(nodesGroup);
  }
  
  // Apply visual matrix transform
  function applyTransform() {
    mapLayers.setAttribute("transform", `translate(${panX}, ${panY}) scale(${zoomScale})`);
  }
  
  // Store applyTransform in window scope for touch handlers
  window.applyTransform = applyTransform;
  
  // Zoom Controls
  document.getElementById("map-zoom-in").addEventListener("click", () => {
    zoomScale = Math.min(zoomScale + 0.25, 4.0);
    applyTransform();
  });
  
  document.getElementById("map-zoom-out").addEventListener("click", () => {
    zoomScale = Math.max(zoomScale - 0.25, 0.5);
    applyTransform();
  });
  
  document.getElementById("map-reset").addEventListener("click", () => {
    panX = 0;
    panY = 0;
    zoomScale = 1.0;
    applyTransform();
  });
  
  // Desktop Mouse: Drag to Pan logic
  mapContainer.addEventListener("mousedown", (e) => {
    // Only pan on left click background drag, not node click
    if (e.target.classList.contains("node")) return;
    isDragging = true;
    startDragX = e.clientX - panX;
    startDragY = e.clientY - panY;
  });
  
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    panX = e.clientX - startDragX;
    panY = e.clientY - startDragY;
    applyTransform();
  });
  
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
  
  // Desktop Mouse: Scroll to zoom
  mapContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) {
      zoomScale = Math.min(zoomScale + zoomFactor, 4.0);
    } else {
      zoomScale = Math.max(zoomScale - zoomFactor, 0.5);
    }
    applyTransform();
  });
  
  // Hover & Click states for Node Circles
  nodes.forEach(node => {
    const code = node.dataset.code;
    const s = STATIONS[code];
    
    // Hover Tooltip (Desktop only)
    if (!isMobile()) {
      node.addEventListener("mouseenter", (e) => {
        tooltip.style.display = "block";
        tooltip.innerHTML = `
          <div class="tooltip-title">${s.name} (${s.code})</div>
          <div class="tooltip-subtitle">City: ${s.city} | Zone: ${s.zone}</div>
        `;
        positionTooltip(e);
        
        // Temporary highlight connecting lines for inspection
        highlightConnectingEdges(code, true);
      });
      
      node.addEventListener("mousemove", (e) => {
        positionTooltip(e);
      });
      
      node.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
        highlightConnectingEdges(code, false);
      });
    }
    
    // Click selection: Single click selects Source, Shift click selects Destination
    node.addEventListener("click", (e) => {
      if (e.shiftKey || (currentSource && !currentDestination)) {
        // Set Destination
        if (code === currentSource) {
          alert("Source and Destination cannot be the same station.");
          return;
        }
        setSearchState(currentSource, code, currentCriteria, currentClass);
        calculateJourney();
      } else {
        // Set Source (or replace if both set)
        if (currentSource && currentDestination) {
          setSearchState(code, "", currentCriteria, currentClass);
          clearActiveRoute();
        } else {
          setSearchState(code, currentDestination, currentCriteria, currentClass);
        }
      }
    });
  });
  
  function positionTooltip(e) {
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top + 15;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }
}

// Touch handlers for mobile
function setupTouchHandlers() {
  const mapContainer = document.getElementById("map-container");
  
  mapContainer.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      isDragging = true;
      startDragX = e.touches[0].clientX - panX;
      startDragY = e.touches[0].clientY - panY;
    } else if (e.touches.length === 2) {
      // Two finger touch - pinch zoom
      isDragging = false;
      lastDistance = getTouchDistance(e);
    }
  });
  
  mapContainer.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      // Single touch pan
      panX = e.touches[0].clientX - startDragX;
      panY = e.touches[0].clientY - startDragY;
      window.applyTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      // Two finger pinch zoom
      const currentDistance = getTouchDistance(e);
      if (lastDistance > 0) {
        const zoomFactor = currentDistance / lastDistance;
        zoomScale = Math.max(0.5, Math.min(4.0, zoomScale * (1 + (zoomFactor - 1) * 0.1)));
        window.applyTransform();
      }
      lastDistance = currentDistance;
    }
  });
  
  mapContainer.addEventListener("touchend", (e) => {
    isDragging = false;
    lastDistance = 0;
  });
  
  // Prevent default touch behaviors that interfere with interaction
  mapContainer.addEventListener("touchstart", (e) => {
    if (e.target.classList.contains("node")) {
      // Allow node clicks
      e.preventDefault();
    }
  }, { passive: false });
}

// Temporary highlight adjacent connections when hovering over a node
function highlightConnectingEdges(stationCode, enable) {
  CONNECTIONS.forEach(conn => {
    if (conn.from === stationCode || conn.to === stationCode) {
      const line = document.getElementById(`edge-${conn.from}-${conn.to}`);
      if (line && !line.classList.contains("active-path")) {
        if (enable) {
          line.classList.add("connected-hover");
        } else {
          line.classList.remove("connected-hover");
        }
      }
    }
  });
}

// Synchronize inputs and visual states
function setSearchState(src, dest, crit, cls) {
  currentSource = src;
  currentDestination = dest;
  currentCriteria = crit;
  currentClass = cls;
  
  // Sync dropdowns
  document.getElementById("source-select").value = src;
  document.getElementById("dest-select").value = dest;
  
  // Sync criteria active classes
  const critOpts = document.querySelectorAll(".criteria-option");
  critOpts.forEach(o => {
    if (o.dataset.criteria === crit) o.classList.add("active");
    else o.classList.remove("active");
  });
  
  // Sync class selectors
  const clsOpts = document.querySelectorAll(".class-option");
  clsOpts.forEach(o => {
    if (o.dataset.class === cls) o.classList.add("active");
    else o.classList.remove("active");
  });
  
  updatePulseRings();
}

// Update the glowing pulse rings under the selected source/destination nodes
function updatePulseRings() {
  const pulseSrc = document.getElementById("pulse-source");
  const pulseDst = document.getElementById("pulse-dest");
  
  // Reset active node highlights
  const nodes = document.querySelectorAll(".node");
  nodes.forEach(n => {
    n.classList.remove("selected-source", "selected-dest");
  });
  
  if (currentSource && STATIONS[currentSource]) {
    const node = document.getElementById(`node-${currentSource}`);
    node.classList.add("selected-source");
    
    const coord = project(STATIONS[currentSource].lat, STATIONS[currentSource].lon);
    pulseSrc.setAttribute("cx", coord.x);
    pulseSrc.setAttribute("cy", coord.y);
    pulseSrc.classList.add("active");
  } else {
    pulseSrc.classList.remove("active");
  }
  
  if (currentDestination && STATIONS[currentDestination]) {
    const node = document.getElementById(`node-${currentDestination}`);
    node.classList.add("selected-dest");
    
    const coord = project(STATIONS[currentDestination].lat, STATIONS[currentDestination].lon);
    pulseDst.setAttribute("cx", coord.x);
    pulseDst.setAttribute("cy", coord.y);
    pulseDst.classList.add("active");
  } else {
    pulseDst.classList.remove("active");
  }
}

// Popular Preset routes population
function setupPresets() {
  const presetsList = document.getElementById("presets-list");
  const presets = [
    { from: "NDLS", to: "MMCT", label: "Delhi ➔ Mumbai", class: "3A" },
    { from: "HWH", to: "NDLS", label: "Kolkata ➔ Delhi", class: "3A" },
    { from: "MMCT", to: "SBC", label: "Mumbai ➔ Bengaluru", class: "SL" },
    { from: "GHY", to: "MAO", label: "Guwahati ➔ Goa (Scenic)", class: "2A" },
    { from: "NDLS", to: "TVC", label: "Delhi ➔ Trivandrum", class: "3A" }
  ];
  
  presetsList.innerHTML = "";
  presets.forEach(p => {
    const item = document.createElement("div");
    item.className = "preset-item";
    
    const labelSpan = document.createElement("span");
    labelSpan.className = "preset-cities";
    labelSpan.innerHTML = `${STATIONS[p.from].city} <span>➔</span> ${STATIONS[p.to].city}`;
    
    const classBadge = document.createElement("span");
    classBadge.className = "preset-badge";
    classBadge.textContent = p.class;
    
    item.appendChild(labelSpan);
    item.appendChild(classBadge);
    
    item.addEventListener("click", () => {
      setSearchState(p.from, p.to, "fastest", p.class);
      calculateJourney();
    });
    
    presetsList.appendChild(item);
  });
}

// Route form submit calculator
function setupFormHandler() {
  document.getElementById("btn-calculate").addEventListener("click", () => {
    calculateJourney();
  });
}

// Compute the path and animate the map
function calculateJourney() {
  if (!currentSource || !currentDestination) {
    return;
  }
  
  if (currentSource === currentDestination) {
    alert("Please select different departure and arrival stations.");
    return;
  }
  
  const startDay = document.getElementById("start-day").value;
  const startTime = document.getElementById("start-time").value;
  
  // 1. Run optimization engine
  const result = findOptimalRoute(currentSource, currentDestination, currentCriteria, currentClass, startDay, startTime);
  
  if (result.error) {
    renderError(result.error);
    return;
  }
  
  activeRoute = result;
  
  // 2. Render visual metrics summaries
  document.getElementById("results-card").style.display = "block";
  document.getElementById("summary-time").textContent = result.totalDurationStr;
  document.getElementById("summary-fare").textContent = `₹${result.totalFare}`;
  document.getElementById("summary-distance").textContent = `${result.totalDistance} km`;
  document.getElementById("summary-transfers").textContent = result.numTransfers === 0 ? "Direct" : `${result.numTransfers} Transfer(s)`;
  
  // 3. Render Detailed Timeline
  renderTimeline(result);
  
  // 4. Highlight path in the SVG network
  highlightPath(result);
  
  // 5. On mobile, scroll to results
  if (isMobile()) {
    setTimeout(() => {
      const resultsCard = document.getElementById("results-card");
      if (resultsCard) {
        resultsCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }
}

// Render Detailed Travel Itinerary
function renderTimeline(route) {
  const container = document.getElementById("timeline-container");
  container.innerHTML = "";
  
  // Start Node
  let html = `
    <div class="timeline-node-card start">
      <div class="timeline-station-name">
        <span>${route.sourceName} (${route.source})</span>
        <span class="timeline-time">${route.startTimeStr}</span>
      </div>
      <div class="timeline-station-subtitle">Origin Junction • Region: ${STATIONS[route.source].zone}</div>
    </div>
  `;
  
  route.itinerary.forEach((step, idx) => {
    // Show layover notice if transit station has a train switch
    if (step.layover) {
      html += `
        <div class="timeline-node-card transfer">
          <div class="timeline-station-name">
            <span>${STATIONS[step.from].name} (${step.from})</span>
            <span class="timeline-time" style="color: var(--secondary);">${step.depTime}</span>
          </div>
          <div class="timeline-station-subtitle">Transfer Junction • Layover: ${step.layover}</div>
          <div class="layover-alert">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span>Wait <strong>${step.layover}</strong> at station to board connection</span>
          </div>
        </div>
      `;
    }
    
    // Train Segment
    html += `
      <div class="timeline-segment-card">
        <div class="segment-train-box">
          <div class="segment-train-header">
            <span class="segment-train-name">${step.trainName}</span>
            <span class="segment-train-number">#${step.trainId}</span>
          </div>
          <div class="segment-train-details">
            <span><i class="fa-regular fa-clock"></i> ${step.duration}</span>
            <span><i class="fa-solid fa-arrow-right-long"></i> ${step.distance} km</span>
            <span><i class="fa-solid fa-ticket"></i> ₹${step.fare} (${currentClass})</span>
          </div>
        </div>
      </div>
    `;
    
    // If it's the last step, render Destination Node
    if (idx === route.itinerary.length - 1) {
      html += `
        <div class="timeline-node-card end">
          <div class="timeline-station-name">
            <span>${step.toName} (${step.to})</span>
            <span class="timeline-time">${step.arrTime}</span>
          </div>
          <div class="timeline-station-subtitle">Destination • Region: ${STATIONS[step.to].zone}</div>
        </div>
      `;
    }
  });
  
  container.innerHTML = html;
}

// Render error states
function renderError(msg) {
  document.getElementById("results-card").style.display = "none";
  const container = document.getElementById("timeline-container");
  container.innerHTML = `
    <div class="empty-state" style="color: var(--accent-pink);">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p style="font-weight: 600; margin-bottom: 0.5rem;">Pathfinding Error</p>
      <p style="font-size: 0.8rem; color: var(--text-secondary); max-width: 280px; margin: auto;">${msg}</p>
    </div>
  `;
  clearSVGPathHighlights();
}

// Clear currently drawn route nodes/edges on resets
function clearActiveRoute() {
  activeRoute = null;
  document.getElementById("results-card").style.display = "none";
  const container = document.getElementById("timeline-container");
  container.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-train"></i>
      <p>Select stations and click 'Optimize Journey' to calculate path.</p>
    </div>
  `;
  clearSVGPathHighlights();
}

function clearSVGPathHighlights() {
  const edges = document.querySelectorAll(".edge");
  const animEdges = document.querySelectorAll(".edge-glow-animated");
  const nodes = document.querySelectorAll(".node");
  const labels = document.querySelectorAll(".node-label");
  
  edges.forEach(e => {
    e.classList.remove("active-path");
    e.style.stroke = "";
  });
  
  animEdges.forEach(e => {
    e.classList.remove("active");
  });
  
  nodes.forEach(n => {
    n.classList.remove("active-path-node");
  });
  
  labels.forEach(l => {
    l.classList.remove("active");
  });
}

// Highlight the computed optimal path on the map
function highlightPath(route) {
  clearSVGPathHighlights();
  
  const activeNodes = new Set();
  
  route.itinerary.forEach(step => {
    activeNodes.add(step.from);
    activeNodes.add(step.to);
    
    // Find edge line forward or backward
    let edge = document.getElementById(`edge-${step.from}-${step.to}`);
    let animEdge = document.getElementById(`edge-anim-${step.from}-${step.to}`);
    
    if (!edge) {
      edge = document.getElementById(`edge-${step.to}-${step.from}`);
      animEdge = document.getElementById(`edge-anim-${step.to}-${step.from}`);
    }
    
    if (edge) {
      edge.classList.add("active-path");
    }
    
    if (animEdge) {
      animEdge.classList.add("active");
    }
  });
  
  // Highlight node circles and text labels along the path
  activeNodes.forEach(code => {
    const node = document.getElementById(`node-${code}`);
    const label = document.getElementById(`label-${code}`);
    if (node) node.classList.add("active-path-node");
    if (label) label.classList.add("active");
  });
}
