// The placeholders every campaign is written against. A campaign is a skeleton of roles
// (a station we hold, the host country it stands in, a rival across the water, the
// rival's harbour, our intercept network, our reserve) and a world fills those roles
// with names. The story copy only ever says W.host, W.rival and so on, so another world
// file gives another campaign on the same skeleton.
export const KESTREL = {
  id: "kestrel",
  strait: "Kestrel Strait",
  station: "Beacon Station", stationShort: "Beacon",
  host: "Marenna", hostAdj: "Marennan",
  rival: "Ravellan",
  harbour: "Sarn",
  network: "Lattice",
  reserve: "2nd Battalion",
  // Distances and sizes the copy quotes. Invented for this prototype; see the README.
  harbourNm: 30, straitNm: 40, garrison: 140, battalion: 600, battery: 120, ministers: 11,
};

export const WORLD = KESTREL;
