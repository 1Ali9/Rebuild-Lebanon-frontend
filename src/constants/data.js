export const specialties = [
  "Civil Engineer",
  "Architect",
  "Mason",
  "Blacksmith",
  "Glass Specialist",
  "Plumber",
  "Painter",
  "Aluminum Frame Specialist",
  "Carpenter",
  "Tiler",
  "Waterproofing Specialist",
  "Electrician",
  "Stone Cladding Specialist",
  "HVAC Technician",
]

export const districtByGovernorate = {
  Beirut: ["Beirut"],
  "Mount Lebanon": ["Baabda", "Aley", "Chouf", "Keserwan", "Metn", "Jbeil"],
  North: ["Tripoli", "Akkar", "Bcharre", "Koura", "Miniyeh-Danniyeh", "Zgharta", "Batroun"],
  Akkar: ["Akkar"],
  Beqaa: ["Zahle", "West Beqaa", "Rashaya"],
  "Baalbek-Hermel": ["Baalbek", "Hermel"],
  South: ["Saida", "Tyre", "Jezzine"],
  Nabatieh: ["Nabatieh", "Marjeyoun", "Hasbaya", "Bint Jbeil"],
}

export const governorates = Object.keys(districtByGovernorate)
