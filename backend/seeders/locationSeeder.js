import models from "../models/index.js";

const { Division, District, Area } = models;

// Bangladesh location seed data
const locationData = {
  divisions: [
    { name: "Dhaka", code: "DHA", country: "Bangladesh" },
    { name: "Chittagong", code: "CTG", country: "Bangladesh" },
    { name: "Rajshahi", code: "RAJ", country: "Bangladesh" },
    { name: "Khulna", code: "KHL", country: "Bangladesh" },
    { name: "Sylhet", code: "SYL", country: "Bangladesh" },
    { name: "Barisal", code: "BAR", country: "Bangladesh" },
    { name: "Rangpur", code: "RAN", country: "Bangladesh" },
    { name: "Mymensingh", code: "MYM", country: "Bangladesh" },
  ],

  districts: [
    // Dhaka Division
    { division: "Dhaka", name: "Dhaka", code: "DHA" },
    { division: "Dhaka", name: "Gazipur", code: "GAZ" },
    { division: "Dhaka", name: "Narayanganj", code: "NAR" },
    { division: "Dhaka", name: "Tangail", code: "TAN" },

    // Chittagong Division
    { division: "Chittagong", name: "Chittagong", code: "CTG" },
    { division: "Chittagong", name: "Cox's Bazar", code: "COX" },
    { division: "Chittagong", name: "Comilla", code: "COM" },

    // Rajshahi Division
    { division: "Rajshahi", name: "Rajshahi", code: "RAJ" },
    { division: "Rajshahi", name: "Bogra", code: "BOG" },

    // Khulna Division
    { division: "Khulna", name: "Khulna", code: "KHL" },
    { division: "Khulna", name: "Jessore", code: "JES" },

    // Sylhet Division
    { division: "Sylhet", name: "Sylhet", code: "SYL" },
    { division: "Sylhet", name: "Moulvibazar", code: "MOU" },

    // Barisal Division
    { division: "Barisal", name: "Barisal", code: "BAR" },

    // Rangpur Division
    { division: "Rangpur", name: "Rangpur", code: "RAN" },

    // Mymensingh Division
    { division: "Mymensingh", name: "Mymensingh", code: "MYM" },
  ],

  areas: [
    // Dhaka District - Popular Areas
    {
      district: "Dhaka",
      name: "Uttara",
      type: "Residential",
      popular: true,
      center_latitude: 23.8607,
      center_longitude: 90.4125,
    },
    {
      district: "Dhaka",
      name: "Gulshan",
      type: "Commercial",
      popular: true,
      center_latitude: 23.7808,
      center_longitude: 90.4126,
    },
    {
      district: "Dhaka",
      name: "Dhanmondi",
      type: "Mixed",
      popular: true,
      center_latitude: 23.7461,
      center_longitude: 90.3742,
    },
    {
      district: "Dhaka",
      name: "Banani",
      type: "Commercial",
      popular: true,
      center_latitude: 23.7937,
      center_longitude: 90.4066,
    },
    {
      district: "Dhaka",
      name: "Mirpur",
      type: "Residential",
      popular: true,
      center_latitude: 23.8223,
      center_longitude: 90.3654,
    },
    {
      district: "Dhaka",
      name: "Motijheel",
      type: "Commercial",
      popular: true,
      center_latitude: 23.733,
      center_longitude: 90.4172,
    },
    {
      district: "Dhaka",
      name: "Mohammadpur",
      type: "Residential",
      popular: true,
      center_latitude: 23.7656,
      center_longitude: 90.3563,
    },
    {
      district: "Dhaka",
      name: "Bashundhara",
      type: "Mixed",
      popular: true,
      center_latitude: 23.8231,
      center_longitude: 90.4254,
    },

    // Dhaka District - Other Areas
    {
      district: "Dhaka",
      name: "Badda",
      type: "Residential",
      popular: false,
      center_latitude: 23.7805,
      center_longitude: 90.4285,
    },
    {
      district: "Dhaka",
      name: "Rampura",
      type: "Mixed",
      popular: false,
      center_latitude: 23.7586,
      center_longitude: 90.4239,
    },
    {
      district: "Dhaka",
      name: "Khilkhet",
      type: "Residential",
      popular: false,
      center_latitude: 23.8289,
      center_longitude: 90.4252,
    },
    {
      district: "Dhaka",
      name: "Baridhara",
      type: "Residential",
      popular: false,
      center_latitude: 23.8088,
      center_longitude: 90.4226,
    },
    {
      district: "Dhaka",
      name: "Tejgaon",
      type: "Industrial",
      popular: false,
      center_latitude: 23.7641,
      center_longitude: 90.3916,
    },
    {
      district: "Dhaka",
      name: "Khilgaon",
      type: "Residential",
      popular: false,
      center_latitude: 23.7516,
      center_longitude: 90.4286,
    },
    {
      district: "Dhaka",
      name: "Malibagh",
      type: "Residential",
      popular: false,
      center_latitude: 23.7381,
      center_longitude: 90.4285,
    },
    {
      district: "Dhaka",
      name: "Shyamoli",
      type: "Residential",
      popular: false,
      center_latitude: 23.7686,
      center_longitude: 90.3697,
    },
    {
      district: "Dhaka",
      name: "Lalmatia",
      type: "Residential",
      popular: false,
      center_latitude: 23.7563,
      center_longitude: 90.3697,
    },
    {
      district: "Dhaka",
      name: "Hazaribagh",
      type: "Industrial",
      popular: false,
      center_latitude: 23.7292,
      center_longitude: 90.3611,
    },
    {
      district: "Dhaka",
      name: "Old Dhaka",
      type: "Mixed",
      popular: false,
      center_latitude: 23.7104,
      center_longitude: 90.4074,
    },
    {
      district: "Dhaka",
      name: "Jatrabari",
      type: "Commercial",
      popular: false,
      center_latitude: 23.71,
      center_longitude: 90.4318,
    },

    // Gazipur District
    {
      district: "Gazipur",
      name: "Gazipur Sadar",
      type: "Mixed",
      popular: true,
      center_latitude: 23.9999,
      center_longitude: 90.4203,
    },
    {
      district: "Gazipur",
      name: "Tongi",
      type: "Industrial",
      popular: true,
      center_latitude: 23.8978,
      center_longitude: 90.4031,
    },

    // Narayanganj District
    {
      district: "Narayanganj",
      name: "Narayanganj Sadar",
      type: "Commercial",
      popular: true,
      center_latitude: 23.6238,
      center_longitude: 90.5,
    },

    // Chittagong District
    {
      district: "Chittagong",
      name: "Agrabad",
      type: "Commercial",
      popular: true,
      center_latitude: 22.3281,
      center_longitude: 91.7997,
    },
    {
      district: "Chittagong",
      name: "Khulshi",
      type: "Residential",
      popular: true,
      center_latitude: 22.3392,
      center_longitude: 91.808,
    },
    {
      district: "Chittagong",
      name: "Panchlaish",
      type: "Mixed",
      popular: true,
      center_latitude: 22.3616,
      center_longitude: 91.825,
    },
    {
      district: "Chittagong",
      name: "GEC Circle",
      type: "Commercial",
      popular: false,
      center_latitude: 22.365,
      center_longitude: 91.8168,
    },

    // Cox's Bazar District
    {
      district: "Cox's Bazar",
      name: "Cox's Bazar Sadar",
      type: "Mixed",
      popular: true,
      center_latitude: 21.4272,
      center_longitude: 92.0058,
    },

    // Sylhet District
    {
      district: "Sylhet",
      name: "Sylhet Sadar",
      type: "Mixed",
      popular: true,
      center_latitude: 24.8949,
      center_longitude: 91.8687,
    },
    {
      district: "Sylhet",
      name: "Zindabazar",
      type: "Commercial",
      popular: true,
      center_latitude: 24.8992,
      center_longitude: 91.8697,
    },

    // Rajshahi District
    {
      district: "Rajshahi",
      name: "Rajshahi Sadar",
      type: "Mixed",
      popular: true,
      center_latitude: 24.3745,
      center_longitude: 88.6042,
    },

    // Khulna District
    {
      district: "Khulna",
      name: "Khulna Sadar",
      type: "Mixed",
      popular: true,
      center_latitude: 22.8456,
      center_longitude: 89.5403,
    },
  ],
};

// Seed function
export const seedLocations = async () => {
  try {
    console.log("🌱 Starting location data seeding...");

    // Check if data already exists
    const existingDivisions = await Division.count();
    if (existingDivisions > 0) {
      console.log("⚠️  Location data already exists. Skipping seed.");
      return;
    }

    // Seed Divisions
    console.log("📍 Seeding divisions...");
    const divisions = await Division.bulkCreate(locationData.divisions);
    console.log(`✅ Created ${divisions.length} divisions`);

    // Seed Districts
    console.log("📍 Seeding districts...");
    const districtPromises = locationData.districts.map(
      async (districtData) => {
        const division = divisions.find(
          (d) => d.name === districtData.division
        );
        return District.create({
          division_id: division.id,
          name: districtData.name,
          code: districtData.code,
        });
      }
    );
    const districts = await Promise.all(districtPromises);
    console.log(`✅ Created ${districts.length} districts`);

    // Seed Areas
    console.log("📍 Seeding areas...");
    const areaPromises = locationData.areas.map(async (areaData) => {
      const district = districts.find((d) => d.name === areaData.district);
      return Area.create({
        district_id: district.id,
        name: areaData.name,
        type: areaData.type,
        popular: areaData.popular,
        center_latitude: areaData.center_latitude,
        center_longitude: areaData.center_longitude,
      });
    });
    const areas = await Promise.all(areaPromises);
    console.log(`✅ Created ${areas.length} areas`);

    console.log("🎉 Location seeding completed successfully!");
    console.log(`
📊 Summary:
   - Divisions: ${divisions.length}
   - Districts: ${districts.length}
   - Areas: ${areas.length}
   - Popular Areas: ${areas.filter((a) => a.popular).length}
    `);

    return { divisions, districts, areas };
  } catch (error) {
    console.error("❌ Error seeding location data:", error);
    throw error;
  }
};

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { sequelize } = await import("../models/index.js");
  await sequelize.sync({ alter: true });
  await seedLocations();
  await sequelize.close();
  process.exit(0);
}

export default seedLocations;
