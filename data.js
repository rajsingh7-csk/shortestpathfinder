// Indian Railways Network Dataset
// Contains major railway junctions, their geographical coordinates, and train schedules connecting them.

const STATIONS = {
  "NDLS": { code: "NDLS", name: "New Delhi", city: "Delhi", lat: 28.6139, lon: 77.2090, zone: "Northern" },
  "ASR": { code: "ASR", name: "Amritsar Jn", city: "Amritsar", lat: 31.6340, lon: 74.8723, zone: "Northern" },
  "CDG": { code: "CDG", name: "Chandigarh", city: "Chandigarh", lat: 30.7333, lon: 76.7794, zone: "Northern" },
  "JAT": { code: "JAT", name: "Jammu Tawi", city: "Jammu", lat: 32.7266, lon: 74.8570, zone: "Northern" },
  "JP": { code: "JP", name: "Jaipur Jn", city: "Jaipur", lat: 26.9124, lon: 75.7873, zone: "North Western" },
  "KOTA": { code: "KOTA", name: "Kota Jn", city: "Kota", lat: 25.2138, lon: 75.8648, zone: "West Central" },
  "AGC": { code: "AGC", name: "Agra Cantt", city: "Agra", lat: 27.1767, lon: 78.0081, zone: "North Central" },
  "CNB": { code: "CNB", name: "Kanpur Central", city: "Kanpur", lat: 26.4499, lon: 80.3319, zone: "North Central" },
  "LKO": { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow", lat: 26.8315, lon: 80.9157, zone: "Northern" },
  "BSB": { code: "BSB", name: "Varanasi Jn", city: "Varanasi", lat: 25.3176, lon: 82.9739, zone: "North Eastern" },
  "GKP": { code: "GKP", name: "Gorakhpur Jn", city: "Gorakhpur", lat: 26.7606, lon: 83.3731, zone: "North Eastern" },
  "PRYJ": { code: "PRYJ", name: "Prayagraj Jn", city: "Prayagraj", lat: 25.4358, lon: 81.8463, zone: "North Central" },
  "DDU": { code: "DDU", name: "Pt. Deen Dayal Upadhyaya", city: "Mughalsarai", lat: 25.2818, lon: 83.1235, zone: "East Central" },
  "PNBE": { code: "PNBE", name: "Patna Jn", city: "Patna", lat: 25.6026, lon: 85.1376, zone: "East Central" },
  "HWH": { code: "HWH", name: "Howrah Jn", city: "Kolkata", lat: 22.5830, lon: 88.3433, zone: "Eastern" },
  "GHY": { code: "GHY", name: "Guwahati", city: "Guwahati", lat: 26.1822, lon: 91.7539, zone: "Northeast Frontier" },
  "RTM": { code: "RTM", name: "Ratlam Jn", city: "Ratlam", lat: 23.3315, lon: 75.0367, zone: "Western" },
  "ADI": { code: "ADI", name: "Ahmedabad Jn", city: "Ahmedabad", lat: 23.0225, lon: 72.5714, zone: "Western" },
  "VAD": { code: "VAD", name: "Vadodara Jn", city: "Vadodara", lat: 22.3072, lon: 73.1812, zone: "Western" },
  "MMCT": { code: "MMCT", name: "Mumbai Central", city: "Mumbai", lat: 18.9696, lon: 72.8193, zone: "Western" },
  "PNQ": { code: "PNQ", name: "Pune Jn", city: "Pune", lat: 18.5284, lon: 73.8739, zone: "Central" },
  "MAO": { code: "MAO", name: "Madgaon (Goa)", city: "Goa", lat: 15.2736, lon: 73.9582, zone: "Konkan" },
  "ERS": { code: "ERS", name: "Ernakulam Jn", city: "Kochi", lat: 9.9637, lon: 76.2979, zone: "Southern" },
  "TVC": { code: "TVC", name: "Trivandrum Central", city: "Trivandrum", lat: 8.5241, lon: 76.9366, zone: "Southern" },
  "CBE": { code: "CBE", name: "Coimbatore Jn", city: "Coimbatore", lat: 11.0168, lon: 76.9558, zone: "Southern" },
  "SBC": { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru", lat: 12.9716, lon: 77.5946, zone: "South Western" },
  "MAS": { code: "MAS", name: "MGR Chennai Central", city: "Chennai", lat: 13.0827, lon: 80.2707, zone: "Southern" },
  "GTL": { code: "GTL", name: "Guntakal Jn", city: "Guntakal", lat: 15.1667, lon: 77.3833, zone: "South Central" },
  "SUR": { code: "SUR", name: "Solapur", city: "Solapur", lat: 17.6599, lon: 75.9064, zone: "Central" },
  "HYB": { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad", lat: 17.3850, lon: 78.4867, zone: "South Central" },
  "NGP": { code: "NGP", name: "Nagpur Jn", city: "Nagpur", lat: 21.1458, lon: 79.0882, zone: "Central" },
  "BPL": { code: "BPL", name: "Bhopal Jn", city: "Bhopal", lat: 23.2599, lon: 77.4126, zone: "West Central" },
  "JBP": { code: "JBP", name: "Jabalpur", city: "Jabalpur", lat: 23.1686, lon: 79.9339, zone: "West Central" },
  "R": { code: "R", name: "Raipur Jn", city: "Raipur", lat: 21.2514, lon: 81.6296, zone: "South East Central" },
  "BBS": { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", lat: 20.2961, lon: 85.8245, zone: "East Coast" },
  "VSKP": { code: "VSKP", name: "Visakhapatnam", city: "Visakhapatnam", lat: 17.6868, lon: 83.2185, zone: "East Coast" }
};

// Direct Connections (Edges) with Trains operating on each segment.
// Distances are in kilometers. Duration in minutes.
// Fares are approximate base fares in INR for SL (Sleeper), 3A (3AC), 2A (2AC), and 1A (First AC).
// If a class is not available, it is null.

const CONNECTIONS = [
  {
    from: "NDLS", to: "AGC", distance: 195,
    trains: [
      { id: "12002", name: "New Delhi - Bhopal Shatabdi Express", type: "Shatabdi", depTime: "06:00", arrTime: "07:57", duration: 117, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 455, "2A": 625, "1A": 1010 } },
      { id: "22416", name: "Andhra Pradesh Express", type: "Superfast", depTime: "06:25", arrTime: "08:45", duration: 140, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 175, "3A": 505, "2A": 710, "1A": 1175 } },
      { id: "12626", name: "Kerala Express", type: "Superfast", depTime: "20:10", arrTime: "22:20", duration: 130, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 175, "3A": 505, "2A": 710, "1A": 1175 } }
    ]
  },
  {
    from: "AGC", to: "BPL", distance: 510,
    trains: [
      { id: "12002", name: "New Delhi - Bhopal Shatabdi Express", type: "Shatabdi", depTime: "08:02", arrTime: "14:40", duration: 398, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 980, "2A": 1395, "1A": 2340 } },
      { id: "12626", name: "Kerala Express", type: "Superfast", depTime: "22:25", arrTime: "05:05", duration: 400, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 320, "3A": 860, "2A": 1215, "1A": 2025 } }
    ]
  },
  {
    from: "BPL", to: "JBP", distance: 290,
    trains: [
      { id: "12061", name: "Habibganj - Jabalpur Jan Shatabdi", type: "Superfast", depTime: "17:40", arrTime: "22:30", duration: 290, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 145, "3A": null, "2A": 485, "1A": null } },
      { id: "11463", name: "Somnath - Jabalpur Express", type: "Express", depTime: "07:20", arrTime: "13:30", duration: 370, days: ["Tue", "Wed", "Thu", "Sat", "Sun"], fares: { SL: 200, "3A": 555, "2A": 795, "1A": 1345 } }
    ]
  },
  {
    from: "BPL", to: "NGP", distance: 298,
    trains: [
      { id: "12626", name: "Kerala Express", type: "Superfast", depTime: "05:10", arrTime: "10:15", duration: 305, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 220, "3A": 605, "2A": 855, "1A": 1435 } },
      { id: "12724", name: "Telangana Express", type: "Superfast", depTime: "16:05", arrTime: "21:25", duration: 320, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 220, "3A": 605, "2A": 855, "1A": 1435 } }
    ]
  },
  {
    from: "NGP", to: "R", distance: 302,
    trains: [
      { id: "12833", name: "Ahmedabad - Howrah Express", type: "Superfast", depTime: "18:05", arrTime: "22:50", duration: 285, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 225, "3A": 610, "2A": 865, "1A": 1445 } },
      { id: "12859", name: "Gitanjali Express", type: "Superfast", depTime: "19:00", arrTime: "23:30", duration: 270, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 225, "3A": 610, "2A": 865, "1A": 1445 } }
    ]
  },
  {
    from: "R", to: "BBS", distance: 570,
    trains: [
      { id: "12844", name: "Ahmedabad - Puri Express", type: "Superfast", depTime: "13:40", arrTime: "23:30", duration: 590, days: ["Mon", "Fri", "Sat", "Sun"], fares: { SL: 345, "3A": 930, "2A": 1320, "1A": 2225 } },
      { id: "18406", name: "LTT - Bhubaneswar Express", type: "Express", depTime: "06:10", arrTime: "19:00", duration: 770, days: ["Sat"], fares: { SL: 315, "3A": 855, "2A": 1220, "1A": 2075 } }
    ]
  },
  {
    from: "BBS", to: "VSKP", distance: 443,
    trains: [
      { id: "12841", name: "Coromandel Express", type: "Superfast", depTime: "22:00", arrTime: "04:25", duration: 385, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 295, "3A": 790, "2A": 1115, "1A": 1875 } },
      { id: "12863", name: "Howrah - Yesvantpur SF", type: "Superfast", depTime: "23:05", arrTime: "05:40", duration: 395, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 295, "3A": 790, "2A": 1115, "1A": 1875 } }
    ]
  },
  {
    from: "VSKP", to: "MAS", distance: 800,
    trains: [
      { id: "12841", name: "Coromandel Express", type: "Superfast", depTime: "04:45", arrTime: "17:00", duration: 735, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 435, "3A": 1180, "2A": 1680, "1A": 2845 } },
      { id: "22603", name: "Kharagpur - Villupuram SF Express", type: "Superfast", depTime: "11:20", arrTime: "23:45", duration: 745, days: ["Fri"], fares: { SL: 435, "3A": 1180, "2A": 1680, "1A": 2845 } }
    ]
  },
  {
    from: "NDLS", to: "CDG", distance: 244,
    trains: [
      { id: "12011", name: "Kalka Shatabdi Express", type: "Shatabdi", depTime: "07:40", arrTime: "10:45", duration: 185, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 530, "2A": 745, "1A": 1215 } },
      { id: "12005", name: "New Delhi - Kalka Shatabdi", type: "Shatabdi", depTime: "17:15", arrTime: "20:20", duration: 185, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 530, "2A": 745, "1A": 1215 } }
    ]
  },
  {
    from: "CDG", to: "JAT", distance: 340,
    trains: [
      { id: "12237", name: "Begampura Express", type: "Superfast", depTime: "03:45", arrTime: "11:00", duration: 435, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 240, "3A": 650, "2A": 915, "1A": 1540 } },
      { id: "19226", name: "Jodhpur - Jammu Tawi Express", type: "Express", depTime: "18:25", arrTime: "03:00", duration: 515, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 220, "3A": 600, "2A": 860, "1A": null } }
    ]
  },
  {
    from: "NDLS", to: "ASR", distance: 448,
    trains: [
      { id: "12013", name: "Amritsar Shatabdi Express", type: "Shatabdi", depTime: "16:30", arrTime: "22:30", duration: 360, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 890, "2A": 1270, "1A": 2110 } },
      { id: "12459", name: "New Delhi - Amritsar Intercity", type: "Superfast", depTime: "13:40", arrTime: "21:50", duration: 490, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 175, "3A": 505, "2A": 725, "1A": null } }
    ]
  },
  {
    from: "NDLS", to: "JP", distance: 308,
    trains: [
      { id: "12015", name: "Ajmer Shatabdi Express", type: "Shatabdi", depTime: "06:10", arrTime: "10:40", duration: 270, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 645, "2A": 910, "1A": 1515 } },
      { id: "12986", name: "Delhi Sarai Rohilla - Jaipur Double Decker", type: "Superfast", depTime: "17:35", arrTime: "22:05", duration: 270, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 145, "3A": null, "2A": 550, "1A": null } }
    ]
  },
  {
    from: "JP", to: "ADI", distance: 625,
    trains: [
      { id: "12916", name: "Ashram Express", type: "Superfast", depTime: "20:25", arrTime: "06:20", duration: 595, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 365, "3A": 990, "2A": 1400, "1A": 2360 } },
      { id: "12958", name: "Swarna Jayanti Rajdhani Express", type: "Rajdhani", depTime: "23:55", arrTime: "08:15", duration: 500, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 1150, "2A": 1600, "1A": 2690 } }
    ]
  },
  {
    from: "ADI", to: "VAD", distance: 100,
    trains: [
      { id: "12010", name: "Ahmedabad - Mumbai Central Shatabdi", type: "Shatabdi", depTime: "15:10", arrTime: "16:20", duration: 70, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], fares: { SL: null, "3A": 310, "2A": 445, "1A": 725 } },
      { id: "12952", name: "Mumbai Rajdhani Express", type: "Rajdhani", depTime: "22:15", arrTime: "23:15", duration: 60, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 410, "2A": 570, "1A": 930 } }
    ]
  },
  {
    from: "NDLS", to: "KOTA", distance: 465,
    trains: [
      { id: "12952", name: "Mumbai Rajdhani Express", type: "Rajdhani", depTime: "16:55", arrTime: "21:40", duration: 285, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 925, "2A": 1290, "1A": 2165 } },
      { id: "12474", name: "Sarvodaya Express", type: "Superfast", depTime: "21:40", arrTime: "02:45", duration: 305, days: ["Thu"], fares: { SL: 285, "3A": 770, "2A": 1090, "1A": 1825 } }
    ]
  },
  {
    from: "KOTA", to: "RTM", distance: 266,
    trains: [
      { id: "12952", name: "Mumbai Rajdhani Express", type: "Rajdhani", depTime: "21:45", arrTime: "00:42", duration: 177, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 605, "2A": 845, "1A": 1410 } },
      { id: "12474", name: "Sarvodaya Express", type: "Superfast", depTime: "02:50", arrTime: "06:10", duration: 200, days: ["Fri"], fares: { SL: 200, "3A": 555, "2A": 795, "1A": null } }
    ]
  },
  {
    from: "RTM", to: "VAD", distance: 260,
    trains: [
      { id: "12952", name: "Mumbai Rajdhani Express", type: "Rajdhani", depTime: "00:45", arrTime: "03:40", duration: 175, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 595, "2A": 830, "1A": 1390 } },
      { id: "12474", name: "Sarvodaya Express", type: "Superfast", depTime: "06:15", arrTime: "09:40", duration: 205, days: ["Fri"], fares: { SL: 200, "3A": 555, "2A": 795, "1A": null } }
    ]
  },
  {
    from: "VAD", to: "MMCT", distance: 392,
    trains: [
      { id: "12952", name: "Mumbai Rajdhani Express", type: "Rajdhani", depTime: "03:45", arrTime: "08:35", duration: 290, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 810, "2A": 1130, "1A": 1900 } },
      { id: "12010", name: "Ahmedabad - Mumbai Central Shatabdi", type: "Shatabdi", depTime: "16:25", arrTime: "21:45", duration: 320, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], fares: { SL: null, "3A": 725, "2A": 1030, "1A": 1720 } }
    ]
  },
  {
    from: "MMCT", to: "PNQ", distance: 192,
    trains: [
      { id: "12125", name: "Pragati Express", type: "Superfast", depTime: "16:25", arrTime: "19:50", duration: 205, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 170, "3A": null, "2A": 480, "1A": null } },
      { id: "12127", name: "Mumbai Pune Intercity Express", type: "Superfast", depTime: "06:40", arrTime: "09:57", duration: 197, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 170, "3A": null, "2A": 480, "1A": null } }
    ]
  },
  {
    from: "MMCT", to: "MAO", distance: 750,
    trains: [
      { id: "10111", name: "Konkan Kanya Express", type: "Express", depTime: "23:05", arrTime: "10:45", duration: 700, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 410, "3A": 1110, "2A": 1595, "1A": 2700 } },
      { id: "12119", name: "Madgaon Jan Shatabdi Express", type: "Superfast", depTime: "05:10", arrTime: "14:10", duration: 540, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 275, "3A": null, "2A": 890, "1A": null } }
    ]
  },
  {
    from: "MAO", to: "ERS", distance: 700,
    trains: [
      { id: "16345", name: "Netravati Express", type: "Express", depTime: "22:30", arrTime: "12:50", duration: 860, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 390, "3A": 1050, "2A": 1520, "1A": 2570 } },
      { id: "12618", name: "Mangala Lakshadweep SF", type: "Superfast", depTime: "19:00", arrTime: "07:30", duration: 750, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 415, "3A": 1125, "2A": 1600, "1A": null } }
    ]
  },
  {
    from: "ERS", to: "TVC", distance: 220,
    trains: [
      { id: "12081", name: "Kannur - Trivandrum Jan Shatabdi", type: "Superfast", depTime: "09:30", arrTime: "13:50", duration: 260, days: ["Mon", "Tue", "Thu", "Fri", "Sat"], fares: { SL: 115, "3A": null, "2A": 385, "1A": null } },
      { id: "16345", name: "Netravati Express", type: "Express", depTime: "13:00", arrTime: "18:25", duration: 325, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 170, "3A": 490, "2A": 700, "1A": 1180 } }
    ]
  },
  {
    from: "PNQ", to: "SUR", distance: 262,
    trains: [
      { id: "12157", name: "Hutatma Express", type: "Superfast", depTime: "18:00", arrTime: "21:40", duration: 220, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 195, "3A": null, "2A": 525, "1A": null } },
      { id: "11301", name: "Udyan Express", type: "Express", depTime: "11:45", arrTime: "15:40", duration: 235, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 185, "3A": 505, "2A": 710, "1A": 1205 } }
    ]
  },
  {
    from: "SUR", to: "GTL", distance: 315,
    trains: [
      { id: "11301", name: "Udyan Express", type: "Express", depTime: "15:45", arrTime: "22:20", duration: 395, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 215, "3A": 580, "2A": 825, "1A": 1395 } },
      { id: "12628", name: "Karnataka Express", type: "Superfast", depTime: "14:15", arrTime: "19:40", duration: 325, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 235, "3A": 635, "2A": 900, "1A": 1515 } }
    ]
  },
  {
    from: "GTL", to: "SBC", distance: 280,
    trains: [
      { id: "11301", name: "Udyan Express", type: "Express", depTime: "22:25", arrTime: "06:00", duration: 455, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 200, "3A": 540, "2A": 770, "1A": 1300 } },
      { id: "12628", name: "Karnataka Express", type: "Superfast", depTime: "19:45", arrTime: "23:40", duration: 235, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 220, "3A": 595, "2A": 845, "1A": 1415 } }
    ]
  },
  {
    from: "GTL", to: "HYB", distance: 410,
    trains: [
      { id: "12786", name: "Kacheguda Express", type: "Superfast", depTime: "22:45", arrTime: "05:40", duration: 415, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 265, "3A": 720, "2A": 1020, "1A": 1720 } }
    ]
  },
  {
    from: "SBC", to: "CBE", distance: 380,
    trains: [
      { id: "12677", name: "KSR Bengaluru - Ernakulam Intercity SF", type: "Superfast", depTime: "06:10", arrTime: "12:50", duration: 400, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 250, "3A": null, "2A": 680, "1A": null } }
    ]
  },
  {
    from: "CBE", to: "ERS", distance: 190,
    trains: [
      { id: "12677", name: "KSR Bengaluru - Ernakulam Intercity SF", type: "Superfast", depTime: "12:55", arrTime: "16:55", duration: 240, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 170, "3A": null, "2A": 480, "1A": null } },
      { id: "12626", name: "Kerala Express", type: "Superfast", depTime: "10:15", arrTime: "14:15", duration: 240, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 170, "3A": 490, "2A": 690, "1A": 1160 } }
    ]
  },
  {
    from: "SBC", to: "MAS", distance: 360,
    trains: [
      { id: "12028", name: "Shatabdi Express", type: "Shatabdi", depTime: "06:00", arrTime: "11:00", duration: 300, days: ["Mon", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 745, "2A": 1045, "1A": 1750 } },
      { id: "12658", name: "Chennai Mail", type: "Superfast", depTime: "22:40", arrTime: "04:35", duration: 355, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 245, "3A": 670, "2A": 945, "1A": 1595 } }
    ]
  },
  {
    from: "MAS", to: "HYB", distance: 700,
    trains: [
      { id: "12759", name: "Charminar Express", type: "Superfast", depTime: "18:10", arrTime: "08:00", duration: 830, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 410, "3A": 1110, "2A": 1595, "1A": 2700 } }
    ]
  },
  {
    from: "HYB", to: "NGP", distance: 580,
    trains: [
      { id: "12723", name: "Telangana Express", type: "Superfast", depTime: "06:00", arrTime: "15:55", duration: 595, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 355, "3A": 965, "2A": 1370, "1A": 2305 } }
    ]
  },
  {
    from: "NDLS", to: "CNB", distance: 440,
    trains: [
      { id: "12302", name: "Howrah Rajdhani Express", type: "Rajdhani", depTime: "16:50", arrTime: "21:32", duration: 282, days: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 890, "2A": 1240, "1A": 2080 } },
      { id: "12802", name: "Purushottam Express", type: "Superfast", depTime: "22:40", arrTime: "04:00", duration: 320, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 280, "3A": 750, "2A": 1060, "1A": 1780 } }
    ]
  },
  {
    from: "CNB", to: "LKO", distance: 72,
    trains: [
      { id: "12004", name: "Lucknow Shatabdi Express", type: "Shatabdi", depTime: "11:20", arrTime: "12:40", duration: 80, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 260, "2A": 380, "1A": 575 } },
      { id: "12534", name: "Pushpak Express", type: "Superfast", depTime: "07:15", arrTime: "08:40", duration: 85, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 100, "3A": 350, "2A": 485, "1A": null } }
    ]
  },
  {
    from: "CNB", to: "PRYJ", distance: 194,
    trains: [
      { id: "12302", name: "Howrah Rajdhani Express", type: "Rajdhani", depTime: "21:37", arrTime: "23:43", duration: 126, days: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 510, "2A": 710, "1A": 1180 } },
      { id: "12802", name: "Purushottam Express", type: "Superfast", depTime: "04:05", arrTime: "06:55", duration: 170, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 175, "3A": 505, "2A": 710, "1A": 1175 } }
    ]
  },
  {
    from: "PRYJ", to: "BSB", distance: 120,
    trains: [
      { id: "15160", name: "Sarnath Express", type: "Express", depTime: "12:10", arrTime: "15:25", duration: 195, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 140, "3A": 380, "2A": 550, "1A": 900 } }
    ]
  },
  {
    from: "PRYJ", to: "DDU", distance: 150,
    trains: [
      { id: "12302", name: "Howrah Rajdhani Express", type: "Rajdhani", depTime: "23:48", arrTime: "01:42", duration: 114, days: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 465, "2A": 650, "1A": 1050 } },
      { id: "12802", name: "Purushottam Express", type: "Superfast", depTime: "07:00", arrTime: "09:50", duration: 170, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 150, "3A": 420, "2A": 600, "1A": null } }
    ]
  },
  {
    from: "DDU", to: "PNBE", distance: 212,
    trains: [
      { id: "12310", name: "Patna Rajdhani Express", type: "Rajdhani", depTime: "01:25", arrTime: "04:40", duration: 195, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 530, "2A": 745, "1A": 1215 } },
      { id: "12392", name: "Shramjeevi SF Express", type: "Superfast", depTime: "03:45", arrTime: "07:05", duration: 200, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 180, "3A": 510, "2A": 725, "1A": 1205 } }
    ]
  },
  {
    from: "PNBE", to: "HWH", distance: 530,
    trains: [
      { id: "12304", name: "Poorva Express", type: "Superfast", depTime: "08:10", arrTime: "17:00", duration: 530, days: ["Mon", "Thu", "Fri", "Sun"], fares: { SL: 325, "3A": 880, "2A": 1250, "1A": 2100 } }
    ]
  },
  {
    from: "DDU", to: "HWH", distance: 660,
    trains: [
      { id: "12302", name: "Howrah Rajdhani Express", type: "Rajdhani", depTime: "01:47", arrTime: "09:55", duration: 488, days: ["Tue", "Wed", "Fri", "Sat", "Sun"], fares: { SL: null, "3A": 1180, "2A": 1660, "1A": 2790 } }
    ]
  },
  {
    from: "LKO", to: "GKP", distance: 270,
    trains: [
      { id: "12558", name: "Sapt Kranti SF Express", type: "Superfast", depTime: "22:50", arrTime: "03:50", duration: 300, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 200, "3A": 555, "2A": 795, "1A": null } }
    ]
  },
  {
    from: "GKP", to: "PNBE", distance: 250,
    trains: [
      { id: "15204", name: "Lucknow - Barauni Express", type: "Express", depTime: "20:00", arrTime: "02:30", duration: 390, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 175, "3A": 490, "2A": 700, "1A": 1180 } }
    ]
  },
  {
    from: "HWH", to: "GHY", distance: 1000,
    trains: [
      { id: "12345", name: "Saraighat Express", type: "Superfast", depTime: "15:55", arrTime: "09:30", duration: 1055, days: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 510, "3A": 1390, "2A": 1980, "1A": 3340 } }
    ]
  },
  {
    from: "LKO", to: "BSB", distance: 300,
    trains: [
      { id: "14204", name: "Lucknow - Varanasi Intercity", type: "Express", depTime: "07:00", arrTime: "12:30", duration: 330, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], fares: { SL: 120, "3A": null, "2A": 420, "1A": null } }
    ]
  }
];

// Helper to get all reciprocal (reverse) trains/connections automatically
// so we don't have to define everything twice.
// Since train directions usually mirror each other, we can reverse departure/arrival times
// or model it as a bi-directional graph where edges can be traveled both ways with equivalent costs.
// For realism, let's auto-generate reciprocal connections by copying the same edge in reverse.
// A simple function will run on startup in app.js or routing.js to make it bi-directional.

if (typeof module !== "undefined" && module.exports) {
  module.exports = { STATIONS, CONNECTIONS };
}
