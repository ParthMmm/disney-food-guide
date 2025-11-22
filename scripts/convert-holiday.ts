import fs from "node:fs";
import path from "node:path";

interface FoodItem {
	id: number;
	name: string;
	description: string;
	location: string;
	restaurant: string;
	price: number | null;
	category: string;
	itemType: string;
	mobileOrderAvailable: boolean;
	availability: {
		startDate: string;
		endDate: string;
	};
	imageUrl: string | null;
	tags: string[];
}

interface FoodGuideData {
	metadata: {
		generatedAt: string;
		totalItems: number;
		dataSource: string;
		filters: {
			locations: string[];
			restaurants: string[];
			categories: string[];
			allTags: string[];
		};
	};
	items: FoodItem[];
}

// Category mapping based on keywords
const categoryMap: Record<string, string> = {
	// Baked desserts
	cake: "baked-dessert",
	cookie: "baked-dessert",
	brownie: "baked-dessert",
	cupcake: "baked-dessert",
	donut: "baked-dessert",
	gingerbread: "baked-dessert",
	tart: "baked-dessert",
	churro: "baked-dessert",
	pie: "baked-dessert",
	cheesecake: "baked-dessert",
	trifle: "baked-dessert",
	cobbler: "baked-dessert",
	muffin: "baked-dessert",
	macaron: "baked-dessert",
	"crisped rice treat": "baked-dessert",
	"rice treat": "baked-dessert",
	"pull-apart": "baked-dessert",
	"sourdough bread": "baked-dessert",
	beignet: "baked-dessert",
	// Cocktails
	cocktail: "cocktail",
	margarita: "cocktail",
	sangria: "cocktail",
	mule: "cocktail",
	mimosa: "cocktail",
	punch: "cocktail",
	cosmopolitan: "cocktail",
	// Beer & wine
	beer: "beer-wine",
	wine: "beer-wine",
	cyder: "beer-wine",
	cider: "beer-wine",
	lager: "beer-wine",
	stout: "beer-wine",
	ale: "beer-wine",
	ipa: "beer-wine",
	prosecco: "beer-wine",
	champagne: "beer-wine",
	brewery: "beer-wine",
	hefeweizen: "beer-wine",
	// Hard seltzers
	seltzer: "hard-seltzer",
	"hard seltzer": "hard-seltzer",
	// Coffee & tea
	coffee: "coffee-tea",
	latte: "coffee-tea",
	cappuccino: "coffee-tea",
	espresso: "coffee-tea",
	mocha: "coffee-tea",
	tea: "coffee-tea",
	chai: "coffee-tea",
	"cold brew": "coffee-tea",
	// Frozen desserts
	sundae: "frozen-dessert",
	"ice cream": "frozen-dessert",
	float: "frozen-dessert",
	shake: "frozen-dessert",
	parfait: "frozen-dessert",
	mousse: "frozen-dessert",
	"soft serve": "frozen-dessert",
	cone: "frozen-dessert",
	// Soft drinks
	soda: "non-alcoholic-beverage",
	lemonade: "non-alcoholic-beverage",
	limeade: "non-alcoholic-beverage",
	juice: "non-alcoholic-beverage",
	smoothie: "non-alcoholic-beverage",
	cooler: "non-alcoholic-beverage",
	"iced tea": "non-alcoholic-beverage",
	slushie: "non-alcoholic-beverage",
	"agua fresca": "non-alcoholic-beverage",
	eggnog: "non-alcoholic-beverage",
	"mint julep": "non-alcoholic-beverage",
	// Savory snacks
	pretzel: "savory-snack",
	nachos: "savory-snack",
	popcorn: "savory-snack",
	chips: "savory-snack",
	fries: "savory-snack",
	tots: "savory-snack",
	// Salads
	salad: "salad",
	// Sandwiches & burgers
	burger: "sandwich-burger",
	sandwich: "sandwich-burger",
	slider: "sandwich-burger",
	panini: "sandwich-burger",
	"hot dog": "sandwich-burger",
	// Entrees
	turkey: "entree",
	steak: "entree",
	pasta: "entree",
	salmon: "entree",
	chicken: "entree",
	pork: "entree",
	dinner: "entree",
	medallion: "entree",
	skewer: "entree",
	kebab: "entree",
	"prime rib": "entree",
	tamal: "entree",
	tamale: "entree",
	// Candy snacks
	candy: "candy-snack",
	chocolate: "candy-snack",
	fudge: "candy-snack",
	caramel: "candy-snack",
	brittle: "candy-snack",
};

function categorizeItem(name: string, description: string): string {
	const combined = `${name} ${description}`.toLowerCase();

	for (const [keyword, category] of Object.entries(categoryMap)) {
		if (combined.includes(keyword)) {
			return category;
		}
	}

	// Default category
	return "other";
}

function extractPrice(text: string): number | null {
	const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
	return priceMatch ? Number.parseFloat(priceMatch[1]) : null;
}

function extractAvailability(text: string): {
	startDate: string;
	endDate: string;
} {
	// Look for patterns like (Available Nov. 14 through Jan. 7)
	const availMatch = text.match(
		/\(Available\s+([A-Za-z]+\.?\s+\d+)\s+through\s+([A-Za-z]+\.?\s+\d+)\)/i,
	);

	if (availMatch) {
		const [, start, end] = availMatch;
		// Convert to ISO dates (assuming 2025/2026)
		const startDate = parseDate(start, 2025);
		const endDate = parseDate(end, 2026);
		return { startDate, endDate };
	}

	// Default to full holiday season
	return {
		startDate: "2025-11-14",
		endDate: "2026-01-07",
	};
}

function parseDate(dateStr: string, year: number): string {
	const months: Record<string, string> = {
		jan: "01",
		feb: "02",
		mar: "03",
		apr: "04",
		may: "05",
		jun: "06",
		jul: "07",
		aug: "08",
		sep: "09",
		oct: "10",
		nov: "11",
		dec: "12",
	};

	const match = dateStr.match(/([A-Za-z]+)\.?\s+(\d+)/);
	if (match) {
		const [, month, day] = match;
		const monthNum = months[month.toLowerCase().substring(0, 3)];
		const dayPadded = day.padStart(2, "0");
		return `${year}-${monthNum}-${dayPadded}`;
	}

	return `${year}-01-01`;
}

function generateTags(
	name: string,
	description: string,
	price: number | null,
): string[] {
	const tags: Set<string> = new Set();
	const combined = `${name} ${description}`.toLowerCase();

	// Alcoholic/Non-alcoholic - check explicitly for non-alcoholic first
	const isExplicitlyNonAlcoholic =
		combined.includes("(non-alcoholic)") ||
		combined.includes("non-alcoholic");

	const hasAlcohol =
		combined.includes("vodka") ||
		combined.includes("bourbon") ||
		combined.includes("whisky") ||
		combined.includes("whiskey") ||
		combined.includes("rum") ||
		combined.includes("tequila") ||
		combined.includes("gin") ||
		combined.includes("beer") ||
		combined.includes("wine") ||
		combined.includes("margarita") ||
		combined.includes("sangria") ||
		combined.includes("mimosa") ||
		combined.includes("mule") ||
		combined.includes("liqueur") ||
		combined.includes("scotch") ||
		combined.includes("rye") ||
		combined.includes("amaro") ||
		combined.includes("prosecco") ||
		combined.includes("champagne") ||
		combined.includes("stout") ||
		combined.includes("lager") ||
		combined.includes("ale") ||
		combined.includes("ipa") ||
		combined.includes("cider") ||
		combined.includes("cyder") ||
		combined.includes("hefeweizen") ||
		combined.includes("seltzer") ||
		combined.includes("hard seltzer") ||
		combined.includes("brewery") ||
		combined.includes("brewing");

	if (isExplicitlyNonAlcoholic) {
		tags.add("non-alcoholic");
	} else if (hasAlcohol) {
		tags.add("alcoholic");
	} else {
		tags.add("non-alcoholic");
	}

	// Plant-based/Vegan
	if (
		combined.includes("plant-based") ||
		combined.includes("(plant-based)")
	) {
		tags.add("plant-based");
		tags.add("vegan");
	}

	// New items
	if (combined.includes("***(new)***") || combined.includes("(new)")) {
		tags.add("new");
	}

	// Dietary tags
	if (combined.includes("gluten")) tags.add("gluten-free");

	// Flavor tags
	if (combined.includes("pumpkin")) tags.add("pumpkin-spice");
	if (combined.includes("gingerbread")) tags.add("gingerbread");
	if (combined.includes("peppermint")) tags.add("peppermint");
	if (combined.includes("cranberry")) tags.add("cranberry");
	if (combined.includes("eggnog")) tags.add("eggnog");
	if (combined.includes("apple")) tags.add("apple");
	if (combined.includes("cinnamon")) tags.add("cinnamon");

	// Character/themed
	if (
		combined.includes("mickey") ||
		combined.includes("minnie") ||
		combined.includes("daisy") ||
		combined.includes("donald") ||
		combined.includes("chip") ||
		combined.includes("dale")
	) {
		tags.add("character-themed");
	}

	// Seasonal
	if (combined.includes("holiday") || combined.includes("festive")) {
		tags.add("seasonal");
	}

	// Food/Drink type
	if (
		combined.includes("coffee") ||
		combined.includes("latte") ||
		combined.includes("cappuccino") ||
		combined.includes("tea")
	) {
		tags.add("coffee-tea");
	}

	if (combined.includes("sweet") || combined.includes("dessert")) {
		tags.add("sweet");
	}

	if (
		combined.includes("savory") ||
		combined.includes("dinner") ||
		combined.includes("meal")
	) {
		tags.add("savory");
	}

	// Temperature
	if (combined.includes("iced") || combined.includes("cold")) {
		tags.add("cold");
	}
	if (combined.includes("hot") || combined.includes("warm")) {
		tags.add("hot");
	}

	// Price tiers
	if (price !== null) {
		if (price < 8) {
			tags.add("budget-friendly");
		} else if (price >= 8 && price < 15) {
			tags.add("moderate-price");
		} else if (price >= 15) {
			tags.add("premium");
		}
	}

	// Nuts warning
	if (
		combined.includes("pecan") ||
		combined.includes("almond") ||
		combined.includes("walnut") ||
		combined.includes("hazelnut")
	) {
		tags.add("contains-nuts");
	}

	return Array.from(tags);
}

function parseMarkdown(content: string): FoodItem[] {
	const items: FoodItem[] = [];
	let currentLocation = "";
	let currentRestaurant = "";
	let mobileOrderAvailable = false;
	let itemId = 1;

	const lines = content.split("\n");
	let imageUrl: string | null = null;

	// Stop processing when we hit merchandise sections
	const merchandiseSections = [
		"## Candy Throughout Disneyland Resort",
		"## Novelties Available Throughout Disneyland Resort",
	];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Check if we've reached merchandise sections
		if (merchandiseSections.some((section) => line === section)) {
			console.log(`Stopping at merchandise section: ${line}`);
			break;
		}

		// Extract location
		if (line.startsWith("## ")) {
			const locationMatch = line.match(/## (.+)/);
			if (locationMatch) {
				currentLocation = locationMatch[1]
					.replace("Disneyland Park", "Disneyland")
					.replace("Disney California Adventure Park", "California Adventure")
					.trim();
			}
		}

		// Extract restaurant
		if (line.startsWith("### ")) {
			const restaurantMatch = line.match(/### (.+)/);
			if (restaurantMatch) {
				currentRestaurant = restaurantMatch[1]
					.replace(/\*\*/g, "")
					.replace(/ \(Mobile Order\)/i, "")
					.trim();

				// Check if mobile order is available
				mobileOrderAvailable = line
					.toLowerCase()
					.includes("(mobile order)");
			}
		}

		// Extract image URL (appears before the item)
		if (line.startsWith("![")) {
			const imgMatch = line.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
			if (imgMatch) {
				imageUrl = imgMatch[1];
			}
		}

		// Extract food items
		if (line.startsWith("- **")) {
			// Try to match the item name and description
			// Common formats:
			// - **Name:** description
			// - **Name** description
			let name = "";
			let description = "";

			// Remove the leading "- **"
			const withoutPrefix = line.substring(4);

			// Find the closing **
			const closingStars = withoutPrefix.indexOf("**");
			if (closingStars > 0) {
				name = withoutPrefix.substring(0, closingStars);
				description = withoutPrefix.substring(closingStars + 2).trim();

				// If description starts with ":", remove it
				if (description.startsWith(":")) {
					description = description.substring(1).trim();
				}

				// Clean up name (remove trailing colons)
				name = name.replace(/:$/, "").trim();

				// Clean up name and description
				const cleanName = name
					.replace(/\*\*\*/g, "")
					.replace(/\*\*/g, "")
					.trim();
				const cleanDescription = description
					.replace(/\*\*\*/g, "")
					.replace(/\*\*/g, "")
					.replace(/\(Available[^)]+\)/gi, "")
					.replace(/\(New\)/gi, "")
					.replace(/\(Plant-based\)/gi, "")
					.replace(/\(Non-alcoholic\)/gi, "")
					.replace(/\(Kids option available\)/gi, "")
					.replace(/\(Mobile Order\)/gi, "")
					.replace(/\(Novelty[^)]+\)/gi, "")
					.replace(/\*Limit[^*]+\*/gi, "")
					.replace(/\*Also[^*]+\*/gi, "")
					.replace(/\s+/g, " ")
					.replace(/\*+/g, "") // Remove any remaining asterisks
					.trim();

				const price = extractPrice(line);
				const availability = extractAvailability(line);

				// Check if item contains meat (red meat or animal protein)
				const meatKeywords = [
					"beef", "steak", "prime rib", "brisket", "meatball", "bacon",
					"pork", "ham", "sausage", "chorizo", "carnitas",
					"chicken", "turkey", "duck",
					"lamb", "veal",
					"salmon", "tuna", "shrimp", "fish", "seafood", "crab", "lobster",
					"impossible meatball", // plant-based alternatives should still be excluded if they say "meatball"
				];

				const combinedForMeatCheck = `${cleanName} ${cleanDescription}`.toLowerCase();
				const hasMeat = meatKeywords.some(keyword => combinedForMeatCheck.includes(keyword));

				if (hasMeat) {
					console.log(`Skipping meat item: ${cleanName}`);
					continue;
				}

				const tags = generateTags(cleanName, description, price);

				// Categorize item (use tags to help with categorization)
				let category = categorizeItem(cleanName, cleanDescription);

				// If item is alcoholic but not categorized as cocktail/beer-wine, make it cocktail
				if (tags.includes("alcoholic") && category !== "cocktail" && category !== "beer-wine") {
					category = "cocktail";
				}

				// Determine item type from category
				const itemTypeMap: Record<string, string> = {
					"baked-dessert": "Baked Dessert",
					cocktail: "Cocktail",
					"beer-wine": "Beer/Wine",
					"coffee-tea": "Coffee/Tea",
					"frozen-dessert": "Frozen Dessert",
					"non-alcoholic-beverage": "Non-Alcoholic Beverage",
					"savory-snack": "Savory Snack",
					salad: "Salad",
					"sandwich-burger": "Sandwich/Burger",
					entree: "Entree",
					"candy-snack": "Candy/Snack",
					other: "Other",
				};

				const item: FoodItem = {
					id: itemId++,
					name: cleanName,
					description: cleanDescription,
					location: currentLocation,
					restaurant: currentRestaurant,
					price,
					category,
					itemType: itemTypeMap[category] || "Other",
					mobileOrderAvailable,
					availability,
					imageUrl,
					tags,
				};

				items.push(item);

				// Reset image URL after using it
				imageUrl = null;
			}
		}
	}

	return items;
}

function generateMetadata(items: FoodItem[]): FoodGuideData["metadata"] {
	const locations = new Set<string>();
	const restaurants = new Set<string>();
	const categories = new Set<string>();
	const allTags = new Set<string>();

	for (const item of items) {
		locations.add(item.location);
		restaurants.add(item.restaurant);
		categories.add(item.category);
		for (const tag of item.tags) {
			allTags.add(tag);
		}
	}

	return {
		generatedAt: new Date().toISOString(),
		totalItems: items.length,
		dataSource: "Disneyland Holiday 2025 Food Guide",
		filters: {
			locations: Array.from(locations).sort(),
			restaurants: Array.from(restaurants).sort(),
			categories: Array.from(categories).sort(),
			allTags: Array.from(allTags).sort(),
		},
	};
}

async function main() {
	const holidayMdPath = path.join(process.cwd(), "holiday.md");
	const outputPath = path.join(
		process.cwd(),
		"static",
		"data",
		"food-holiday.json",
	);

	console.log("Reading holiday.md...");
	const content = fs.readFileSync(holidayMdPath, "utf-8");

	console.log("Parsing items...");
	const items = parseMarkdown(content);

	console.log(`Found ${items.length} food items`);

	console.log("Generating metadata...");
	const metadata = generateMetadata(items);

	const output: FoodGuideData = {
		metadata,
		items,
	};

	console.log("Writing to food-holiday.json...");
	fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

	console.log(`Successfully created ${outputPath}`);
	console.log(`Total items: ${items.length}`);
	console.log(`Locations: ${metadata.filters.locations.join(", ")}`);
	console.log(`Categories: ${metadata.filters.categories.length}`);
	console.log(`Tags: ${metadata.filters.allTags.length}`);
}

main().catch(console.error);
