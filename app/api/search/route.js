const domainMap = {
  fr: { domain: 'amazon.fr', tag: 'thepuresearch-21' },
  en: { domain: 'amazon.com', tag: 'thepuresearch-20' },
  de: { domain: 'amazon.de', tag: 'thepuresear0c-21' },
  es: { domain: 'amazon.es', tag: 'thepuresear04-21' },
  it: { domain: 'amazon.it', tag: 'thepuresea08c-21' },
  pt: { domain: 'amazon.com.br', tag: 'thepuresear00-20' },
  nl: { domain: 'amazon.nl', tag: 'thepuresear0e-21' },
  ja: { domain: 'amazon.co.jp', tag: 'thepuresearch-22' },
  pl: { domain: 'amazon.pl', tag: 'thepuresea07e-21' },
  sv: { domain: 'amazon.se', tag: 'thepuresearch-21' },
  tr: { domain: 'amazon.com.tr', tag: 'thepuresearch-21' },
  ca: { domain: 'amazon.ca', tag: 'thepuresear06-20' },
  au: { domain: 'amazon.com.au', tag: 'thepuresear0a-22' },
};

const ebayMarketMap = {
  fr: { marketplace: 'EBAY_FR', currency: 'EUR', fallback: 'EBAY_DE' },
  en: { marketplace: 'EBAY_US', currency: 'USD', fallback: null },
  de: { marketplace: 'EBAY_DE', currency: 'EUR', fallback: null },
  es: { marketplace: 'EBAY_ES', currency: 'EUR', fallback: 'EBAY_DE' },
  it: { marketplace: 'EBAY_IT', currency: 'EUR', fallback: 'EBAY_DE' },
  nl: { marketplace: 'EBAY_NL', currency: 'EUR', fallback: 'EBAY_DE' },
  ca: { marketplace: 'EBAY_CA', currency: 'CAD', fallback: null },
  au: { marketplace: 'EBAY_AU', currency: 'AUD', fallback: null },
  pl: { marketplace: 'EBAY_PL', currency: 'PLN', fallback: 'EBAY_DE' },
  sv: { marketplace: 'EBAY_SE', currency: 'SEK', fallback: 'EBAY_DE' },
  ja: { marketplace: 'EBAY_US', currency: 'USD', fallback: null },
  pt: { marketplace: 'EBAY_US', currency: 'USD', fallback: null },
  tr: { marketplace: 'EBAY_US', currency: 'USD', fallback: null },
};

async function reformulateWithAI(query, lang) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { keywords: query, category: 'All', condition: null };

  const words = query.trim().split(/\s+/);
  if (words.length <= 2) return { keywords: query, category: 'All', condition: null };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are the search brain of a global shopping engine supporting 13 languages. Your job: extract the EXACT product from ANY query in ANY language and output clean English keywords for eBay/Amazon.

Query (language: ${lang}): "${query}"

═══ KEYWORD RULES ═══
• English only, 2-5 words MAX, product name only
• Strip ALL non-product words: prepositions, pronouns, filler, politeness, context, explanations
• Long sentences → extract ONLY the core product, ignore everything else
• Fix spelling errors intelligently
• Keep brand names, colors, materials ONLY if critical to identify the product
• NEVER output more than 5 words — if unsure, use fewer words

═══ INTENT DETECTION (all languages) ═══
• Gifts → find the ACTUAL product:
  "cadeau frere diabolo"→"diabolo juggling set"
  "cadeau soeur patisserie"→"baking pastry kit"
  "cadeau fils surf"→"surfing book poster figurine"
  "cadeau papa jardinage"→"gardening tools gift set"
  "cadeau papy velo"→"cycling accessories gift"
  "cadeau homme 50 ans nature"→"outdoor nature gift"
  "Geschenk Bruder Diabolo"→"diabolo juggling set"
  "regalo hermana reposteria"→"baking pastry kit"
  "regalo nonno ciclismo"→"cycling accessories gift"
  "cadeau voor zus bakken"→"baking pastry kit"

• Vague/creative → exact product:
  "jeu balle trampoline plage"→"spikeball roundnet game"
  "truc bloquer porte sol"→"door stopper wedge"
  "lecteur dvd rue"→"portable dvd player"
  "Spiel Ball Trampolin Strand"→"spikeball roundnet game"
  "juego pelota trampolín playa"→"spikeball roundnet game"

• Superlatives → product + toprated:
  "meilleur/efficace/mega/bestes/mejor/migliore/beste" → product + sortBy toprated
  "rasoir efficace"→"safety razor"
  "bouchons mega efficace"→"high NRR earplugs"
  "Ohrstöpsel sehr effektiv"→"high NRR earplugs"

• "pour/für/per/para/voor/for" → core product only:
  "bequille pour moto"→"motorcycle paddock stand"
  "fumoir pour poisson"→"fish food smoker"
  "appareil pour cafe"→"espresso machine"
  "Räucherofen für Fisch"→"fish food smoker"
  "ahumador para pescado"→"fish food smoker"

• Wellness/sleep:
  "dormir mieux"→"memory foam pillow"
  "fatigue yeux lampe"→"LED eye care desk lamp"
  "besser schlafen"→"memory foam pillow"
  "dormir mejor"→"memory foam pillow"

• Fitness:
  "produit musculation"→"whey protein creatine"
  "nutriments musculation"→"creatine supplement"
  "sport maison sans materiel"→"resistance bands home workout"
  "Muskelaufbau Produkt"→"whey protein powder"
  "producto musculacion"→"whey protein powder"

• Outdoor/camping:
  "tente 2 personnes randonnee"→"2 person backpacking tent"
  "telescope etoiles pas cher"→"astronomy refractor telescope"
  "sac dos voyage 2 semaines"→"travel backpack 40L"
  "Zelt 2 Personen Wandern"→"2 person backpacking tent"
  "tienda 2 personas senderismo"→"2 person backpacking tent"
  "tenda 2 persone trekking"→"2 person backpacking tent"

• Music:
  "apprendre guitare facilement"→"guitar chord book beginner"
  "guitare acoustique debutant"→"acoustic guitar beginner"
  "Gitarre lernen Anfänger"→"guitar learning book beginner"
  "aprender guitarra principiante"→"acoustic guitar beginner"

• Food/drink:
  "eau gazeuse"→"sparkling water"
  "biere maison"→"home brew beer kit"
  "graines potager balcon"→"vegetable seeds balcony kit"
  "Sprudelwasser"→"sparkling water"
  "agua con gas"→"sparkling water"
  "acqua frizzante"→"sparkling water"
  "Heimbrauerei Bier"→"home brew beer kit"

• Home/deco:
  "decorer chambre pas cher"→"bedroom wall decor stickers"
  "lampe bureau fatigue yeux"→"LED eye care desk lamp"
  "tapis salon rouge"→"large red area rug"
  "bougies vanille quantite"→"vanilla scented candles bulk"
  "Wandaufkleber Schlafzimmer"→"bedroom wall stickers"
  "velas vainilla cantidad"→"vanilla scented candles bulk"
  "candele vaniglia quantita"→"vanilla scented candles bulk"

• Tech:
  "montre connectee sport"→"sports smartwatch fitness tracker"
  "aspirateur robot pas cher"→"robot vacuum cleaner"
  "Sport Smartwatch Herzfrequenz"→"sports smartwatch fitness"
  "smartwatch deporte fitness"→"sports smartwatch fitness"

• Books:
  "livre japonais debutant"→"japanese learning book beginner"
  "livre finances personnelles"→"personal finance book"
  "libro finanzas personales"→"personal finance book"
  "libro medicina piante"→"herbal medicine plant book"

═══ CONDITION DETECTION (all languages) ═══
"used": occasion/d'occasion/bon état/reconditionné/gebraucht/usado/usato/tweedehands/gebruikt/używany/begagnad/kullanılmış/second hand/pre-owned
"new": neuf/nouveau/neu/nuevo/nuovo/nieuw/nowy/ny/yeni/brand new/nwt
else: null

═══ PRICE DETECTION (all languages) ═══
Extract NUMBERS always. Never return null when a price is mentioned.

- maxPrice (less than):
  FR: moins de/max/pas plus de/jusqu'à/maximum/en dessous de/inférieur à/à moins de/pas dépasser/ne pas dépasser/sous les/moins qu'/autour de
  DE: unter/bis zu/maximal/nicht mehr als/höchstens/weniger als
  ES: menos de/hasta/máximo/no más de/por debajo de/inferior a
  IT: meno di/fino a/massimo/non più di/al massimo/sotto i
  NL: minder dan/tot/maximaal/niet meer dan/onder de
  EN: under/less than/max/up to/below/no more than/at most/cheaper than
  PL: mniej niż/do/maksymalnie
  SV: under/upp till/max/mindre än

- minPrice (more than):
  FR: plus de/minimum/supérieur à/au dessus de/à partir de/à plus de/au moins/dès/depuis/dépassant
  DE: mehr als/mindestens/über/ab/wenigstens
  ES: más de/mínimo/superior a/por encima de/al menos/desde
  IT: più di/minimo/superiore a/almeno/oltre i/a partire da
  NL: meer dan/minimaal/boven de/minstens/vanaf
  EN: more than/above/minimum/at least/over/starting from
  PL: więcej niż/powyżej/minimum
  SV: mer än/minst/över/från

- range (between X and Y):
  FR: entre X et Y/de X à Y/compris entre/X-Y euros/de X jusqu'à Y
  DE: zwischen X und Y/von X bis Y/X bis Y Euro
  ES: entre X y Y/de X a Y/X-Y euros
  IT: tra X e Y/fra X e Y/da X a Y/X-Y euro
  NL: tussen X en Y/van X tot Y
  EN: between X and Y/from X to Y/X to Y dollars
  PL: między X a Y/od X do Y
  SV: mellan X och Y/från X till Y

- Slang & informal:
  FR: "balles/euros/€" → euros. "15 balles"=maxPrice 15, "50-60 balles"=minPrice 50 maxPrice 60
  EN: "bucks/dollars/$" → dollars
  DE: "Euro/€" → euros

- "pas cher/günstig/barato/economico/goedkoop/cheap/bon marché/abordable" → sortBy cheapest

═══ SORT DETECTION (all languages) ═══
• "bestselling": plus vendu/meistverkauft/más vendido/più venduto/bestverkocht
• "toprated": meilleur/efficace/bestes/mejor/migliore/beste/am besten
• "cheapest": moins cher/pas cher/günstig/billig/barato/economico/goedkoop
• "expensive": plus cher/teuer/caro/costoso/duur
• "newest": plus récent/neueste/más reciente/più recente/nieuwste

═══ EXAMPLES ═══
"Rasoir le plus efficace" → {"keywords":"safety razor","category":"Health","minPrice":null,"maxPrice":null,"sortBy":"toprated","condition":null,"freeShipping":false}
"Das beste Rasiermesser" → {"keywords":"safety razor","category":"Health","minPrice":null,"maxPrice":null,"sortBy":"toprated","condition":null,"freeShipping":false}
"mejor maquinilla afeitar eficaz" → {"keywords":"safety razor","category":"Health","minPrice":null,"maxPrice":null,"sortBy":"toprated","condition":null,"freeShipping":false}
"cadeau soeur patisserie" → {"keywords":"baking pastry kit","category":"Kitchen","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Backzubehör Geschenk Schwester" → {"keywords":"baking pastry kit","category":"Kitchen","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"kit reposteria regalo hermana" → {"keywords":"baking pastry kit","category":"Kitchen","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"kit pasticceria regalo sorella" → {"keywords":"baking pastry kit","category":"Kitchen","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Dyson occasion" → {"keywords":"Dyson vacuum cleaner","category":"Electronics","minPrice":null,"maxPrice":null,"sortBy":null,"condition":"used","freeShipping":false}
"Dyson gebraucht" → {"keywords":"Dyson vacuum cleaner","category":"Electronics","minPrice":null,"maxPrice":null,"sortBy":null,"condition":"used","freeShipping":false}
"Rolex entre 10000 et 12000" → {"keywords":"Rolex watch","category":"All","minPrice":10000,"maxPrice":12000,"sortBy":null,"condition":null,"freeShipping":false}
"Rolex zwischen 10000 und 12000" → {"keywords":"Rolex watch","category":"All","minPrice":10000,"maxPrice":12000,"sortBy":null,"condition":null,"freeShipping":false}
"Rolex tra 10000 e 12000 euro" → {"keywords":"Rolex watch","category":"All","minPrice":10000,"maxPrice":12000,"sortBy":null,"condition":null,"freeShipping":false}
"eau gazeuse stp" → {"keywords":"sparkling water","category":"Grocery","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Sprudelwasser Großpackung" → {"keywords":"sparkling water bulk","category":"Grocery","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"bouchons oreille mega efficace" → {"keywords":"high NRR earplugs noise reduction","category":"Health","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"jeu plage balle trampoline" → {"keywords":"spikeball roundnet game","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Vatertag Geschenk Papa angeln" → {"keywords":"fishing gift dad","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"fils fan surf cadeau figurine poster" → {"keywords":"surfing poster book gift","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"papy aime velo cadeau" → {"keywords":"cycling accessories gift","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"velo appartement couleur noir" → {"keywords":"black stationary exercise bike","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"telescope etoiles pas cher" → {"keywords":"astronomy refractor telescope","category":"All","minPrice":null,"maxPrice":null,"sortBy":"cheapest","condition":null,"freeShipping":false}
"Teleskop günstig Sterne" → {"keywords":"astronomy refractor telescope","category":"All","minPrice":null,"maxPrice":null,"sortBy":"cheapest","condition":null,"freeShipping":false}
"telescopio barato estrellas" → {"keywords":"astronomy refractor telescope","category":"All","minPrice":null,"maxPrice":null,"sortBy":"cheapest","condition":null,"freeShipping":false}
"tente 2 personnes randonnee" → {"keywords":"2 person backpacking tent","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"aspirateur robot pas cher" → {"keywords":"robot vacuum cleaner","category":"Electronics","minPrice":null,"maxPrice":null,"sortBy":"cheapest","condition":null,"freeShipping":false}
"Saugroboter günstig" → {"keywords":"robot vacuum cleaner","category":"Electronics","minPrice":null,"maxPrice":null,"sortBy":"cheapest","condition":null,"freeShipping":false}
"bougies vanille grande quantite" → {"keywords":"vanilla scented candles bulk","category":"All","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Heimbrauerei Bier Set Anfänger" → {"keywords":"home brew beer kit","category":"Grocery","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Gemüsesamen Balkon Garten" → {"keywords":"vegetable seeds balcony kit","category":"Garden","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"LED Schreibtischlampe augenschonend" → {"keywords":"LED eye care desk lamp","category":"Electronics","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"graines potager balcon ville" → {"keywords":"vegetable seeds balcony kit","category":"Garden","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"lampe bureau fatigue yeux nuit" → {"keywords":"LED eye care desk lamp","category":"Electronics","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"decorer chambre pas cher moderne" → {"keywords":"bedroom wall decor stickers","category":"All","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"livre japonais grand debutant" → {"keywords":"japanese learning book beginner","category":"Books","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Reiserucksack 40L Handgepäck" → {"keywords":"travel backpack 40L carry on","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Espressomaschine 20 Bar Barista" → {"keywords":"espresso machine 20 bar","category":"Kitchen","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"Akustikgitarre günstig Anfänger" → {"keywords":"acoustic guitar beginner","category":"Music","minPrice":null,"maxPrice":null,"sortBy":"cheapest","condition":null,"freeShipping":false}
"proteinas whey chocolate musculacion" → {"keywords":"whey protein chocolate","category":"Health","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"semillas verduras huerto balcon" → {"keywords":"vegetable seeds balcony kit","category":"Garden","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
"outdoor nature gift man 50" → {"keywords":"outdoor hiking gift men","category":"Sports","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}

Output ONLY valid JSON, no markdown, no explanation:
{"keywords":"...","category":"...","minPrice":null,"maxPrice":null,"sortBy":null,"condition":null,"freeShipping":false}
Valid categories: All, Electronics, Clothing, Kitchen, Sports, Books, Toys, Beauty, Garden, Automotive, Health, Music, Tools, Grocery`,
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (!parsed.keywords?.trim()) parsed.keywords = query;
    return parsed;
  } catch (err) {
    return { keywords: query, category: 'All', condition: null };
  }
}

async function searchAmazon(optimizedQuery, category, domain, tag, minPrice, maxPrice, sortBy, freeShipping) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    return [{
      title: 'Voir sur Amazon : ' + optimizedQuery,
      price: '—', rating: '', image: '',
      url: `https://www.${domain}/s?k=${encodeURIComponent(optimizedQuery)}&tag=${tag}`,
      source: 'amazon',
    }];
  }

  try {
    // Mapper le domain vers le country code
    const countryMap = {
      'amazon.fr': 'FR', 'amazon.com': 'US', 'amazon.de': 'DE',
      'amazon.es': 'ES', 'amazon.it': 'IT', 'amazon.co.uk': 'GB',
      'amazon.com.mx': 'MX', 'amazon.ca': 'CA', 'amazon.co.jp': 'JP',
      'amazon.nl': 'NL', 'amazon.pl': 'PL', 'amazon.se': 'SE',
      'amazon.com.br': 'BR', 'amazon.com.au': 'AU', 'amazon.com.tr': 'TR',
    };
    const country = countryMap[domain] || 'US';

    // Tri
    let sort_by = 'RELEVANCE';
    if (sortBy === 'cheapest') sort_by = 'LOWEST_PRICE';
    else if (sortBy === 'expensive') sort_by = 'HIGHEST_PRICE';
    else if (sortBy === 'toprated') sort_by = 'AVERAGE_REVIEW';
    else if (sortBy === 'newest') sort_by = 'NEWEST_ARRIVALS';
    else if (sortBy === 'bestselling') sort_by = 'BEST_SELLERS';

    const params = new URLSearchParams({
      query: optimizedQuery,
      country: country,
      sort_by: sort_by,
      page: '1',
    });
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);

    const response = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }
    );

    const data = await response.json();
    const products = (data?.data?.products || []).slice(0, 3);

    if (products.length === 0) {
      return [{
        title: 'Voir sur Amazon : ' + optimizedQuery,
        price: '—', rating: '', image: '',
        url: `https://www.${domain}/s?k=${encodeURIComponent(optimizedQuery)}&tag=${tag}`,
        source: 'amazon',
      }];
    }

    return products.map(item => {
      const asin = item.asin || '';
      const affUrl = asin
        ? `https://www.${domain}/dp/${asin}?tag=${tag}`
        : `https://www.${domain}/s?k=${encodeURIComponent(optimizedQuery)}&tag=${tag}`;

      const rating = item.product_star_rating
        ? '★'.repeat(Math.round(parseFloat(item.product_star_rating))) + ' ' + item.product_star_rating
        : '';

      return {
        title: item.product_title || 'Produit Amazon',
        price: item.product_price || 'Voir prix',
        rating: rating,
        reviewCount: item.product_num_ratings ? item.product_num_ratings.toLocaleString() : '',
        image: item.product_photo || '',
        url: affUrl,
        source: 'amazon',
      };
    });

  } catch (err) {
    console.error('RAPIDAPI ERROR:', err);
    return [{
      title: 'Voir sur Amazon : ' + optimizedQuery,
      price: '—', rating: '', image: '',
      url: `https://www.${domain}/s?k=${encodeURIComponent(optimizedQuery)}&tag=${tag}`,
      source: 'amazon',
    }];
  }
}

async function searchEbay(optimizedQuery, lang, minPrice, maxPrice, sortBy, freeShipping, condition) {
  const APP_ID = process.env.EBAY_APP_ID;
  const CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID;
  if (!APP_ID) return [];
  try {
    const { marketplace, currency, fallback } = ebayMarketMap[lang] || ebayMarketMap.en;
    const shortQuery = optimizedQuery.split(' ').slice(0, 6).join(' ');
    const filterParts = [];

    if (minPrice && maxPrice) filterParts.push(`price:[${minPrice}..${maxPrice}],priceCurrency:${currency}`);
    else if (minPrice) filterParts.push(`price:[${minPrice}..10000000],priceCurrency:${currency}`);
    else if (maxPrice) filterParts.push(`price:[0..${maxPrice}],priceCurrency:${currency}`);
    if (condition === 'used') filterParts.push('conditionIds:{3000|4000|5000|6000}');
    else if (condition === 'new') filterParts.push('conditionIds:{1000}');
    if (freeShipping) filterParts.push('maxDeliveryCost:0');

    const baseUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(shortQuery)}&limit=3`;
    const urlWithFilters = filterParts.length > 0 ? `${baseUrl}&filter=${filterParts.join(',')}` : baseUrl;
    let sortParam = '';
    if (sortBy === 'cheapest') sortParam = '&sort=price';
    else if (sortBy === 'expensive') sortParam = '&sort=-price';
    else if (sortBy === 'newest') sortParam = '&sort=newlyListed';
    else if (sortBy === 'toprated' || sortBy === 'bestselling') sortParam = '&sort=bestMatch';

    const token = await getEbayToken();
    const fetchEbay = async (mkt, u) => {
      const r = await fetch(u + sortParam, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': mkt,
          'Content-Type': 'application/json',
        },
      });
      const d = await r.json();
      return d.itemSummaries || [];
    };

    // 1. Local avec filtres
    let items = await fetchEbay(marketplace, urlWithFilters);
    // 2. Local sans filtres
    if (items.length === 0 && filterParts.length > 0) items = await fetchEbay(marketplace, baseUrl);
    // 3. Fallback DE avec filtres
    if (items.length === 0 && fallback) items = await fetchEbay(fallback, urlWithFilters);
    // 4. Fallback DE sans filtres
    if (items.length === 0 && fallback && filterParts.length > 0) items = await fetchEbay(fallback, baseUrl);

    return items.map(item => {
      const base = item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`;
      const affUrl = CAMPAIGN_ID
        ? `${base}${base.includes('?') ? '&' : '?'}mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=${CAMPAIGN_ID}&toolid=10050`
        : base;
      return {
        title: item.title || 'Produit eBay',
        price: item.price ? item.price.value + ' ' + item.price.currency : 'Voir prix',
        rating: item.seller?.feedbackScore ? '⭐ ' + item.seller.feedbackScore : '',
        condition: item.condition || '',
        image: item.image?.imageUrl || '',
        url: affUrl,
        source: 'ebay',
      };
    });
  } catch (err) {
    console.error('EBAY ERROR:', err);
    return [];
  }
}

async function getEbayToken() {
  const APP_ID = process.env.EBAY_APP_ID;
  const CERT_ID = process.env.EBAY_CERT_ID;
  if (!APP_ID || !CERT_ID) return '';
  try {
    const creds = Buffer.from(`${APP_ID}:${CERT_ID}`).toString('base64');
    const r = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    });
    const d = await r.json();
    return d.access_token || '';
  } catch { return ''; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const lang = searchParams.get('lang') || 'en';
  const { domain, tag } = domainMap[lang] || domainMap.en;

  const ai = await reformulateWithAI(query, lang);
  const optimizedQuery = ai.keywords || query;
  const category = ai.category || 'All';
  const minPrice = ai.minPrice || null;
  const maxPrice = ai.maxPrice || null;
  const sortBy = ai.sortBy || null;
  const freeShipping = ai.freeShipping || false;
  const condition = ai.condition || null;

  const [amazonResults, ebayResults] = await Promise.all([
    searchAmazon(optimizedQuery, category, domain, tag, minPrice, maxPrice, sortBy, freeShipping),
    searchEbay(optimizedQuery, lang, minPrice, maxPrice, sortBy, freeShipping, condition),
  ]);

  return Response.json({ amazon: amazonResults, ebay: ebayResults });
}