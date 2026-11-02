const db = require('./backend/config/db');

async function seedExpanded() {
  console.log('--- Starting Expanded 50 Food, 30 Room, 30 Desk Seeding ---');

  // 1. 50 FOOD & BEVERAGES
  const foods = [
    // Shelf 1: Traditional Ethiopian Specialties (10)
    {
      item_name: 'Doro Wat',
      category: 'Traditional Ethiopian',
      description: 'Slow-simmered tender chicken drumsticks with authentic berbere sauce, spiced clarified butter, boiled eggs & fresh injera.',
      price: 350,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 25
    },
    {
      item_name: 'Special Shekla Tibs',
      category: 'Traditional Ethiopian',
      description: 'Sizzling prime lamb cooked in clay pot with rosemary, caramelized red onions, garlic & jalapeños.',
      price: 320,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 20
    },
    {
      item_name: 'Kitfo Special',
      category: 'Traditional Ethiopian',
      description: 'Minced lean beef seasoned with mitmita chili & kibbeh spiced butter, served with cottage ayib & gomen greens.',
      price: 340,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 15
    },
    {
      item_name: 'Derek Tibs',
      category: 'Traditional Ethiopian',
      description: 'Pan-crisped succulent beef cubes flash-fried with hot green peppers, onions and aromatic awaze dip.',
      price: 310,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Bozena Shiro',
      category: 'Traditional Ethiopian',
      description: 'Velvety roasted chickpea stew cooked with seasoned minced beef, served boiling hot in traditional clay cookware.',
      price: 220,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Tegabino Shiro',
      category: 'Traditional Ethiopian',
      description: 'Extra thick and bubbling spicy chickpea stew served in sizzling clay pot with warm soft injera rolls.',
      price: 180,
      image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 12
    },
    {
      item_name: 'Gomen Be Sega',
      category: 'Traditional Ethiopian',
      description: 'Tender collard greens braised with spiced beef ribs, garlic, ginger and sweet onions.',
      price: 240,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 20
    },
    {
      item_name: 'Beyaynetu Fasting Platter',
      category: 'Traditional Ethiopian',
      description: 'Colorful 10-dish vegan tasting feast: yellow split peas, red lentils, cabbage, beets, collards, and salad on injera.',
      price: 200,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Zilzil Tibs',
      category: 'Traditional Ethiopian',
      description: 'Long ribbon strips of tender marinated beef, flame grilled and served on a hot tabletop grill.',
      price: 330,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 20
    },
    {
      item_name: 'Key Wat (Spicy Beef Stew)',
      category: 'Traditional Ethiopian',
      description: 'Savory beef chunks slow-simmered in rich berbere sauce with garlic, ginger, and Ethiopian cardamoms.',
      price: 280,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 20
    },

    // Shelf 2: International Gourmet & Master Chef Entrees (10)
    {
      item_name: 'Grilled Prime Ribeye Steak',
      category: 'International Gourmet',
      description: '350g charbroiled prime beef ribeye served with roasted garlic herb butter, seasonal vegetables and potato wedges.',
      price: 550,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 25
    },
    {
      item_name: 'Pan-Seared Norwegian Salmon',
      category: 'International Gourmet',
      description: 'Crisp skin Atlantic salmon fillet rested over lemon-dill hollandaise, buttered baby potatoes, and grilled asparagus.',
      price: 620,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 20
    },
    {
      item_name: 'Paradise Truffle Burger',
      category: 'International Gourmet',
      description: 'Angus beef patty with black truffle aioli, melted aged cheddar, caramelized red onions on a toasted brioche bun.',
      price: 340,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Creamy Chicken Alfredo Fettuccine',
      category: 'International Gourmet',
      description: 'Fresh artisanal pasta tossed in velvety garlic parmesan cream with pan-roasted chicken breast and parsley.',
      price: 290,
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Royal Seafood Paella',
      category: 'International Gourmet',
      description: 'Saffron-infused rice studded with jumbo king prawns, tender calamari rings, green mussels, and sweet peas.',
      price: 480,
      image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 30
    },
    {
      item_name: 'Crispy Calamari Fritti',
      category: 'International Gourmet',
      description: 'Golden lightly battered tender squid rings served with spicy marinara sauce and house tartar dip.',
      price: 260,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 12
    },
    {
      item_name: 'Woodfired Margherita Pizza',
      category: 'International Gourmet',
      description: 'Hand-stretched dough topped with sweet Italian tomato sauce, fresh buffalo mozzarella, and aromatic sweet basil.',
      price: 280,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Woodfired Carnivore Pizza',
      category: 'International Gourmet',
      description: 'Loaded with spicy beef pepperoni, cured ham, seasoned minced beef, smoked mozzarella, and bell peppers.',
      price: 350,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Grilled Chicken Caesar Salad',
      category: 'International Gourmet',
      description: 'Crisp baby romaine hearts, sliced herb chicken breast, shaved parmesan reggiano, and crunchy sourdough croutons.',
      price: 240,
      image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 12
    },
    {
      item_name: 'Moroccan Spiced Lamb Chops',
      category: 'International Gourmet',
      description: 'Tender rosemary and cumin rubbed lamb chops served with fluffy almond couscous and pomegranate glaze.',
      price: 520,
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 25
    },

    // Shelf 3: Morning Breakfast, Bakery & Healthy Bowls (10)
    {
      item_name: 'Paradise Royal Breakfast Platter',
      category: 'Breakfast & Bakery',
      description: 'Two eggs prepared any style, grilled beef sausage, smoked turkey rashers, hash brown, baked beans, and toast.',
      price: 260,
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Ethiopian Chechebsa with Honey',
      category: 'Breakfast & Bakery',
      description: 'Torn pieces of flaky kitcha flatbread gently fried in spiced clarified butter (kibbeh) and organic raw wild honey.',
      price: 190,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 12
    },
    {
      item_name: 'Special Ful Mudammas',
      category: 'Breakfast & Bakery',
      description: 'Warm spiced fava beans topped with chopped eggs, crumbled feta cheese, fresh diced tomatoes, and warm baguette.',
      price: 170,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 10
    },
    {
      item_name: 'Eggs Florentine Benedict',
      category: 'Breakfast & Bakery',
      description: 'Poached free-range eggs over buttered baby spinach and toasted English muffin with velvety hollandaise.',
      price: 250,
      image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Golden Buttermilk Pancakes',
      category: 'Breakfast & Bakery',
      description: 'Fluffy stack of three golden pancakes served with churned butter, pure maple syrup, and fresh blueberries.',
      price: 210,
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Belgian Chocolate Waffles',
      category: 'Breakfast & Bakery',
      description: 'Crispy deep-pocket Belgian waffles crowned with vanilla ice cream, Belgian dark chocolate drizzle and strawberries.',
      price: 230,
      image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 15
    },
    {
      item_name: 'Spiced Kinche Porridge',
      category: 'Breakfast & Bakery',
      description: 'Traditional cracked wheat porridge infused with seasoned aromatic Ethiopian butter, served warm with honey.',
      price: 140,
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 10
    },
    {
      item_name: 'Tropical Fruit & Granola Bowl',
      category: 'Breakfast & Bakery',
      description: 'Freshly diced Debre Markos mango, papaya, pineapple, strawberries over Greek yogurt and crunchy oat granola.',
      price: 180,
      image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 8
    },
    {
      item_name: 'Warm Artisan Croissant Basket',
      category: 'Breakfast & Bakery',
      description: 'Trio of freshly baked flaky all-butter French croissants and chocolate pain au chocolat with berry jam.',
      price: 160,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 5
    },
    {
      item_name: 'Norwegian Smoked Salmon Bagel',
      category: 'Breakfast & Bakery',
      description: 'Toasted sesame bagel with cream cheese, cured smoked salmon, capers, thinly sliced cucumbers and red onions.',
      price: 310,
      image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 10
    },

    // Shelf 4: Chilled Soft Drinks, Fresh Juices & Hot Beverages (10)
    {
      item_name: 'Coca Cola Classic (330ml)',
      category: 'Beverages & Soft Drinks',
      description: 'Ice-cold original Coca Cola glass bottle served with fresh lemon slice and ice bucket.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Sprite Crisp Lemon-Lime (330ml)',
      category: 'Beverages & Soft Drinks',
      description: 'Refreshing sparkling lemon-lime soda served chilled over ice.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Fanta Orange Sparkle (330ml)',
      category: 'Beverages & Soft Drinks',
      description: 'Vibrant and fruity chilled orange soda in iconic glass bottle.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Stoney Tangawizi Ginger Beer',
      category: 'Beverages & Soft Drinks',
      description: 'Extra fiery and spicy East African ginger beer with intense natural ginger kick.',
      price: 55,
      image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Ambo Sparkling Mineral Water (500ml)',
      category: 'Beverages & Soft Drinks',
      description: 'Natural volcanic effervescent sparkling water sourced from Ethiopian highlands, served chilled with lime.',
      price: 45,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Red Bull Energy Drink (250ml)',
      category: 'Beverages & Soft Drinks',
      description: 'Chilled premium energy drink can served on ice with fresh lemon wheel.',
      price: 180,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Triple-Layered Spriss Juice',
      category: 'Beverages & Soft Drinks',
      description: 'Signature Ethiopian layered thick juice: creamy avocado, sweet mango and sun-ripened papaya with lime.',
      price: 130,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 8
    },
    {
      item_name: 'Freshly Squeezed Valencia Orange',
      category: 'Beverages & Soft Drinks',
      description: '100% freshly pressed chilled orange juice, packed with natural vitamin C and zero added sugars.',
      price: 120,
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 5
    },
    {
      item_name: 'Royal Ethiopian Coffee Ceremony',
      category: 'Beverages & Soft Drinks',
      description: 'Freshly pan-roasted organic Arabica beans ground & brewed in traditional clay Jebena pot with burning frankincense & popcorn.',
      price: 80,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 10
    },
    {
      item_name: 'Paradise Special Macchiato',
      category: 'Beverages & Soft Drinks',
      description: 'Double shot rich espresso with velvety microfoam steamed milk and delicate cinnamon art dusting.',
      price: 70,
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 5
    },

    // Shelf 5: Fine Wines, Ethiopian Beers & Crafted Cocktails (10)
    {
      item_name: 'St. George Premium Draught Beer (330ml)',
      category: 'Alcohol & Cocktails',
      description: 'Ethiopia’s legendary crisp and golden lager beer since 1922, served in frosty chilled mug.',
      price: 85,
      image: 'https://images.unsplash.com/photo-1608270104107-1b0460c5a38a?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Castel International Lager (330ml)',
      category: 'Alcohol & Cocktails',
      description: 'Premium French recipe European-style blonde beer with smooth malt notes and refreshing bitterness.',
      price: 90,
      image: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Habesha Cold Gold Lager (330ml)',
      category: 'Alcohol & Cocktails',
      description: 'Brewed with pure highland water and roasted barley for an authentic rich amber flavor.',
      price: 90,
      image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Royal Tej Honey Wine (Traditional Berele)',
      category: 'Alcohol & Cocktails',
      description: 'Traditional fermented Ethiopian golden mead brewed from pure mountain honey & gesho leaves in iconic spherical flask.',
      price: 160,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 3
    },
    {
      item_name: 'Rift Valley Syrah Red Wine (750ml Bottle)',
      category: 'Alcohol & Cocktails',
      description: 'Full-bodied estate bottled Ethiopian red wine from Ziway vineyards with blackberry, dark plum, and spice notes.',
      price: 850,
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 3
    },
    {
      item_name: 'Acacia Medium Sweet White Wine (750ml)',
      category: 'Alcohol & Cocktails',
      description: 'Aromatic and crisp Ethiopian white wine with notes of green apple, white peach, and citrus floral blossom.',
      price: 780,
      image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 3
    },
    {
      item_name: 'Signature Paradise Passion Mojito',
      category: 'Alcohol & Cocktails',
      description: 'Cuban white rum shaken with freshly muddled mint, passion fruit puree, tangy lime juice, and bubbling soda.',
      price: 280,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 5
    },
    {
      item_name: 'Classic Espresso Martini',
      category: 'Alcohol & Cocktails',
      description: 'Premium vodka vigorously shaken with coffee liqueur and freshly extracted hot espresso, garnished with 3 coffee beans.',
      price: 320,
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 5
    },
    {
      item_name: 'Glenfiddich 12-Year Single Malt (50ml)',
      category: 'Alcohol & Cocktails',
      description: 'World-renowned Speyside single malt scotch with distinctive pear notes and subtle oak aromas, served with ice sphere.',
      price: 380,
      image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=900&q=80',
      is_special: 0,
      preparation_time: 2
    },
    {
      item_name: 'Hennessy V.S Cognac Snifter (50ml)',
      category: 'Alcohol & Cocktails',
      description: 'Warm French cognac bursting with intense fruity character and rich oak notes, served in traditional crystal snifter.',
      price: 450,
      image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=900&q=80',
      is_special: 1,
      preparation_time: 2
    }
  ];

  // Insert or update foods
  for (const item of foods) {
    const [existing] = await db.query('SELECT id FROM food_menu WHERE item_name = ?', [item.item_name]);
    if (existing.length > 0) {
      await db.query(`
        UPDATE food_menu SET
          category = ?, description = ?, price = ?, image = ?, is_special = ?, preparation_time = ?
        WHERE id = ?
      `, [item.category, item.description, item.price, item.image, item.is_special, item.preparation_time, existing[0].id]);
    } else {
      await db.query(`
        INSERT INTO food_menu (item_name, category, description, price, availability, image, is_special, preparation_time)
        VALUES (?, ?, ?, ?, 'available', ?, ?, ?)
      `, [item.item_name, item.category, item.description, item.price, item.image, item.is_special, item.preparation_time]);
    }
  }
  console.log(`✅ Foods seeded successfully! Total catalog count: ${foods.length}`);

  // 2. 30 ROOMS & SUITES
  const rooms = [
    // Shelf 1: Royal & Presidential Suites (10)
    { room_number: '401', room_type: 'Presidential Penthouse', price_per_night: 12000, capacity: 4, description: 'The pinnacle of luxury in Debre Markos. Full top-floor penthouse with private jacuzzi, panoramic terrace, personal butler, and grand dining room.', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', amenities: 'Private Jacuzzi, Butler Service, Starlink WiFi, Mountain Panorama, Mini-Bar, King Bed, Kitchenette' },
    { room_number: '402', room_type: 'Grand Ambassador Suite', price_per_night: 9500, capacity: 4, description: 'Sumptuous diplomatic suite featuring an executive conference lounge, master bedroom with walk-in closet, and wraparound sunset balcony.', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', amenities: 'Meeting Lounge, 2 King Beds, Balcony, Espresso Machine, Rain Shower, 65-inch Smart TV' },
    { room_number: '301', room_type: 'Royal Honeymoon Penthouse', price_per_night: 7800, capacity: 2, description: 'Intimate romantic haven with plush king canopy bed, aromatherapy spa bath, chilled champagne bar, and private sunset view.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', amenities: 'Canopy King Bed, Spa Bath, Champagne Bar, Luxury Bathrobe, Private Balcony, High-Speed WiFi' },
    { room_number: '302', room_type: 'Debre Markos Royal Suite', price_per_night: 6500, capacity: 3, description: 'Spacious royal suite blending contemporary architecture with handcrafted Ethiopian wooden art, deep soaking tub and lounge area.', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', amenities: 'Living Room, King Bed, Deep Tub, Fast WiFi, Room Service, Soundproof Windows' },
    { room_number: '303', room_type: 'Choke Mountain View Villa', price_per_night: 5800, capacity: 2, description: 'Breathtaking vistas of the Choke Mountain range, private stone fireplace, and secluded private garden patio.', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', amenities: 'Stone Fireplace, Mountain View, Garden Access, King Bed, Premium Linens, WiFi' },
    { room_number: '304', room_type: 'Executive Diplomatic Suite', price_per_night: 5200, capacity: 2, description: 'Designed for dignitaries and VIPs with an ergonomic mahogany desk, private guest reception lounge, and king master suite.', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', amenities: 'Executive Desk, Private Lounge, Starlink WiFi, Smart TV, Rainfall Shower' },
    { room_number: '305', room_type: 'Grand Family Penthouse', price_per_night: 6200, capacity: 4, description: 'Spacious two-bedroom luxury penthouse with two private en-suite bathrooms, full kitchenette, and children play corner.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', amenities: '2 Queen Beds, 2 En-suite Bathrooms, Kitchenette, Dining Table, WiFi' },
    { room_number: '306', room_type: 'Royal Heritage Suite', price_per_night: 4800, capacity: 2, description: 'Celebrates Gojjam heritage with authentic local tapestries, bespoke timber furnishings, and ultra-comfortable plush king bedding.', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', amenities: 'Traditional Decor, King Bed, Balcony, Coffee Maker, WiFi, Mini Fridge' },
    { room_number: '307', room_type: 'Sky Panorama Suite', price_per_night: 5400, capacity: 2, description: 'Floor-to-ceiling glass windows offering 180-degree unobstructed horizon views of Debre Markos city lights and mountains.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', amenities: 'Panoramic Windows, King Bed, Free Breakfast, Minibar, Smart Entertainment' },
    { room_number: '308', room_type: 'Imperial Corner Suite', price_per_night: 5600, capacity: 2, description: 'Dual expansive balconies providing both sunrise and sunset views with private outdoor lounge seats and jacuzzi bath.', image: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=1200&q=80', amenities: 'Dual Balconies, Jacuzzi Bath, Sunset View, King Bed, 24/7 Room Service' },

    // Shelf 2: Executive Mountain & City View Suites (10)
    { room_number: '201', room_type: 'Executive King Suite', price_per_night: 3800, capacity: 2, description: 'Modern comfort tailored for business travelers and vacationers with king size bed and serene city view.', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', amenities: 'King Bed, Work Station, Fast WiFi, Mini-Bar, Smart TV, AC' },
    { room_number: '202', room_type: 'Executive Twin Suite', price_per_night: 3500, capacity: 2, description: 'Two plush twin beds with individual reading lamps, spacious marble vanity bathroom, and complimentary espresso.', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80', amenities: '2 Twin Beds, Work Desk, Smart TV, Rainfall Shower, WiFi' },
    { room_number: '203', room_type: 'Premier Business Suite', price_per_night: 3900, capacity: 2, description: 'Equipped with dedicated Starlink enterprise high-speed internet, conference call speaker, and ergonomic leather chair.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', amenities: 'Starlink WiFi, Ergonomic Chair, King Bed, Soundproof, Espresso Maker' },
    { room_number: '204', room_type: 'Mountain Panorama Deluxe', price_per_night: 3600, capacity: 2, description: 'Private open-air balcony overlooking pristine pine trees and distant mountain peaks. Fresh highland breeze.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', amenities: 'Mountain Balcony, Queen Bed, Free Breakfast, Minibar, Smart TV' },
    { room_number: '205', room_type: 'Executive Terrace Suite', price_per_night: 4200, capacity: 2, description: 'Direct step-out access to private sun deck with shaded loungers for morning coffee or evening cocktails.', image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80', amenities: 'Private Terrace, Sun Loungers, King Bed, Bathrobes, WiFi' },
    { room_number: '206', room_type: 'Deluxe Family Studio', price_per_night: 4000, capacity: 3, description: 'One King bed plus an extra single daybed, ideal for families traveling with children or small groups.', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', amenities: '1 King + 1 Daybed, Kitchenette, Smart TV, WiFi, Spacious Wardrobe' },
    { room_number: '207', room_type: 'Premium Corner King', price_per_night: 3700, capacity: 2, description: 'Spacious corner layout flooded with natural daylight through dual-aspect soundproof double-glazed windows.', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', amenities: 'Corner Panoramic Views, King Bed, Armchair, Mini-Bar, WiFi' },
    { room_number: '208', room_type: 'Executive Deluxe Room', price_per_night: 3400, capacity: 2, description: 'Refined sanctuary with premium Egyptian cotton bedding, marble bathroom, and complimentary turndown service.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', amenities: 'Queen Bed, Rainfall Shower, Luxury Toiletries, Safe, WiFi' },
    { room_number: '209', room_type: 'Panorama Double Room', price_per_night: 3800, capacity: 4, description: 'Two full double beds with plush pillow tops, panoramic balcony, and tea/coffee making amenities.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', amenities: '2 Double Beds, Balcony, Flat-Screen TV, WiFi, Air Conditioning' },
    { room_number: '210', room_type: 'Executive Suite Plus', price_per_night: 4100, capacity: 2, description: 'Upgraded executive suite featuring a deep freestanding soaking tub, separate rain shower, and walk-in dressing room.', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', amenities: 'Soaking Tub, Dressing Room, King Bed, Minibar, Smart Entertainment' },

    // Shelf 3: Deluxe Comfort & Garden Suites (10)
    { room_number: '101', room_type: 'Deluxe King Garden View', price_per_night: 2800, capacity: 2, description: 'Peaceful ground-floor haven with king bed and French doors opening onto lush landscaped flowering gardens.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', amenities: 'Garden Access, King Bed, Free WiFi, Flat TV, Desk' },
    { room_number: '102', room_type: 'Deluxe Twin Garden', price_per_night: 2600, capacity: 2, description: 'Two single beds with courtyard views, quiet surroundings, writing desk, and en-suite walk-in shower.', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80', amenities: '2 Single Beds, Garden View, WiFi, Hot Shower, Daily Housekeeping' },
    { room_number: '103', room_type: 'Superior Queen Room', price_per_night: 2500, capacity: 2, description: 'Comfortable queen room with plush mattress, blackout curtains, LED lighting, and private tiled bath.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', amenities: 'Queen Bed, Blackout Curtains, WiFi, Smart TV, Desk' },
    { room_number: '104', room_type: 'Deluxe Single Room', price_per_night: 1900, capacity: 1, description: 'Cozy, private solo traveler room with full-size single bed, high-speed WiFi, work chair, and hot shower.', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', amenities: 'Single Bed, Dedicated Desk, WiFi, Wardrobe, Hot Shower' },
    { room_number: '105', room_type: 'Deluxe Double Queen', price_per_night: 3100, capacity: 4, description: 'Two spacious queen beds for colleagues or family, with high ceilings, large closet, and coffee station.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', amenities: '2 Queen Beds, Coffee Station, Flat-Screen TV, WiFi' },
    { room_number: '106', room_type: 'Garden Patio Suite', price_per_night: 2900, capacity: 2, description: 'Direct walkout to a shaded private patio with wrought-iron seating amidst blooming Ethiopian roses and jasmine.', image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80', amenities: 'Private Patio, Queen Bed, Garden View, Tea Maker, WiFi' },
    { room_number: '107', room_type: 'Superior King Comfort', price_per_night: 2800, capacity: 2, description: 'Silent whisper air conditioning, double soundproof glass, and ultra-comfortable King mattress for deep restful sleep.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', amenities: 'Soundproof, King Bed, Whisper AC, Smart TV, WiFi' },
    { room_number: '108', room_type: 'Deluxe Accessible Room', price_per_night: 2700, capacity: 2, description: 'Barrier-free ground level suite with wide doorways, roll-in shower with safety bench, and king bed.', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', amenities: 'Wheelchair Accessible, Roll-in Shower, King Bed, Emergency Cord' },
    { room_number: '109', room_type: 'Traveler Deluxe Single', price_per_night: 1800, capacity: 1, description: 'Budget luxury single room with comfortable orthopedic mattress, power outlets, and clean modern ensuite.', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', amenities: 'Single Bed, Work Desk, Hot Water, WiFi, Daily Maid Service' },
    { room_number: '110', room_type: 'Deluxe Courtyard Queen', price_per_night: 2750, capacity: 2, description: 'Overlooks the central stone courtyard and water fountain. Peaceful ambiance with comfortable queen bedding.', image: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=1200&q=80', amenities: 'Courtyard Fountain View, Queen Bed, WiFi, Safe, Smart TV' }
  ];

  // Insert or update rooms
  for (const r of rooms) {
    const [existing] = await db.query('SELECT id FROM rooms WHERE room_number = ?', [r.room_number]);
    if (existing.length > 0) {
      await db.query(`
        UPDATE rooms SET
          room_type = ?, price_per_night = ?, capacity = ?, description = ?, image = ?, amenities = ?, status = 'available', housekeeping_status = 'clean'
        WHERE id = ?
      `, [r.room_type, r.price_per_night, r.capacity, r.description, r.image, r.amenities, existing[0].id]);
    } else {
      await db.query(`
        INSERT INTO rooms (room_number, room_type, price_per_night, capacity, description, image, amenities, status, housekeeping_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'available', 'clean')
      `, [r.room_number, r.room_type, r.price_per_night, r.capacity, r.description, r.image, r.amenities]);
    }
  }
  console.log(`✅ Rooms seeded successfully! Total room count: ${rooms.length}`);

  // 3. 30 DINING DESKS
  const desks = [
    // Shelf 1: VIP Terrace & Sunset Deck Tables (10)
    { desk_number: 'D01', capacity: 4, location: 'Terrace Sunset Deck', price: 250, description: 'Prime corner table offering unobstructed sunset views of Debre Markos valley and mountains.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D02', capacity: 2, location: 'Terrace Sunset Deck', price: 200, description: 'Intimate edge table ideal for romantic couples enjoying chilled champagne and candlelit dinners.', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D03', capacity: 2, location: 'Terrace Sunset Deck', price: 300, description: 'Private alcove candlelit romance table with fresh rose petals and dedicated wine sommelier.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D04', capacity: 6, location: 'Terrace Sunset Deck', price: 400, description: 'Spacious circular table on the elevated sunset terrace, perfect for celebratory family dining.', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D05', capacity: 4, location: 'Terrace Sunset Deck', price: 250, description: 'High-top panoramic dining booth with cushioned barstools overlooking evening city skyline.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D06', capacity: 4, location: 'Terrace Sunset Deck', price: 300, description: 'Shaded timber pergola table with ambient warm lanterns and gentle highland mountain breezes.', image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D07', capacity: 2, location: 'Terrace Sunset Deck', price: 220, description: 'Observation edge high-top table for two with telescope viewing point for night stargazing.', image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D08', capacity: 8, location: 'Terrace Sunset Deck', price: 600, description: 'Open-air firepit dining circle with plush outdoor armchairs and roaring warm stone fireplace.', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D09', capacity: 2, location: 'Terrace Sunset Deck', price: 280, description: 'Starlight corner table sheltered by jasmine vines, featuring personalized chef tasting menu.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D10', capacity: 10, location: 'Terrace Sunset Deck', price: 750, description: 'Grand outdoor terrace banquet table for corporate celebrations, large family reunions and VIPs.', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80' },

    // Shelf 2: Grand Palace Dining Hall & Royal Booths (10)
    { desk_number: 'D11', capacity: 8, location: 'Grand Palace Dining Hall', price: 500, description: 'Magnificent centerpiece table right beneath the glittering crystal chandelier in main hall.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D12', capacity: 4, location: 'Grand Palace Dining Hall', price: 300, description: 'Luxurious royal blue velvet banquet booth with acoustic soundproofing for private conversations.', image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D13', capacity: 4, location: 'Grand Palace Dining Hall', price: 280, description: 'Large arched window booth looking out over fountain courtyard and manicured flower beds.', image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D14', capacity: 2, location: 'Grand Palace Dining Hall', price: 250, description: 'Intimate recessed archway booth designed for business discussions and quiet romantic dinners.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D15', capacity: 12, location: 'Grand Palace Dining Hall', price: 900, description: 'Long imperial mahogany dining table for ambassadorial dinners, board meetings, and banquet galas.', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D16', capacity: 6, location: 'Grand Palace Dining Hall', price: 450, description: 'Diplomatic dining table with comfortable leather armchairs and personalized beverage station.', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D17', capacity: 4, location: 'Grand Palace Dining Hall', price: 400, description: 'Chef’s open-kitchen viewing table with live culinary plating demonstrations by executive chefs.', image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D18', capacity: 6, location: 'Grand Palace Dining Hall', price: 450, description: 'Warm hearthside table next to crackling indoor stone fireplace with cozy leather seating.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D19', capacity: 4, location: 'Grand Palace Dining Hall', price: 280, description: 'Classic dining table under traditional hand-carved Ethiopian wooden archway with soft lighting.', image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D20', capacity: 10, location: 'Grand Palace Dining Hall', price: 800, description: 'Presidential banquet table with silver candelabras and white damask linens for state visitors.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },

    // Shelf 3: Garden Pavilion & Poolside Cabana Tables (10)
    { desk_number: 'D21', capacity: 4, location: 'Poolside Pergola', price: 350, description: 'Sunken poolside lounge table with turquoise water reflection and chilled cocktail service.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D22', capacity: 6, location: 'Garden Pavilion', price: 450, description: 'Secluded octagonal wooden gazebo surrounded by tropical palms and blooming bougainvillea.', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D23', capacity: 4, location: 'Poolside Pergola', price: 320, description: 'Natural bamboo pergola offering cool breezes, comfortable rattan seating, and privacy drapery.', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D24', capacity: 2, location: 'Garden Pavilion', price: 200, description: 'Charming French bistro table beside central courtyard fountain with gentle water murmurs.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D25', capacity: 8, location: 'Garden Pavilion', price: 650, description: 'Private royal garden cabana with flowing silk drapes, dedicated waiter, and luxury appetizers.', image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D26', capacity: 6, location: 'Garden Pavilion', price: 420, description: 'Shaded palm canopy table on green lawn, ideal for relaxed weekend brunch and afternoon tea.', image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D27', capacity: 2, location: 'Poolside Pergola', price: 280, description: 'Dual poolside sun lounger dining table with cocktail caddy and luxury umbrella shade.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D28', capacity: 4, location: 'Garden Pavilion', price: 300, description: 'Enclosed pergola filled with fragrant jasmine and night-blooming flowers with soft string lights.', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D29', capacity: 4, location: 'Poolside Pergola', price: 320, description: 'Floating deck dining table over illuminated water lily pond with evening candle lanterns.', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80' },
    { desk_number: 'D30', capacity: 12, location: 'Garden Pavilion', price: 1000, description: 'Ultimate VIP Garden Oasis Pavilion with private bar, dedicated chef service, and sound system.', image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80' }
  ];

  // Insert or update desks
  for (const d of desks) {
    const [existing] = await db.query('SELECT id FROM desks WHERE desk_number = ?', [d.desk_number]);
    if (existing.length > 0) {
      await db.query(`
        UPDATE desks SET
          capacity = ?, location = ?, price = ?, description = ?, image = ?, status = 'available'
        WHERE id = ?
      `, [d.capacity, d.location, d.price, d.description, d.image, existing[0].id]);
    } else {
      await db.query(`
        INSERT INTO desks (desk_number, capacity, location, price, description, image, status)
        VALUES (?, ?, ?, ?, ?, ?, 'available')
      `, [d.desk_number, d.capacity, d.location, d.price, d.description, d.image]);
    }
  }
  console.log(`✅ Desks seeded successfully! Total desk count: ${desks.length}`);

  console.log('--- Seeding Complete: 50 Foods, 30 Rooms, 30 Desks in MySQL Database! ---');
  process.exit();
}

seedExpanded().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});

