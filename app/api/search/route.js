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
  fr: 'EBAY_FR',
  en: 'EBAY_US',
  de: 'EBAY_DE',
  es: 'EBAY_ES',
  it: 'EBAY_IT',
  nl: 'EBAY_NL',
  ca: 'EBAY_CA',
  au: 'EBAY_AU',
  pl: 'EBAY_PL',
  sv: 'EBAY_SE',
  ja: 'EBAY_US',
  pt: 'EBAY_US',
  tr: 'EBAY_US',
};

async function reformulateWithAI(query, lang) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { keywords: query, category: 'All' };
  const words = query.trim().split(/\s+/);
  const isSimple = words.length <= 6 && !/\b(je|tu|il|le|la|les|qui|que|pour|avec|dans|veux|cherche|trouve|donne|want|need|looking|find|give|show|something|thing|objet|cadeau|gift|meilleur|best|comme|like|genre|type)\b/i.test(query);
  if (isSimple) return { keywords: query, category: 'All' };
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
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `You are an expert shopping assistant with deep knowledge of products, brands, movies, culture, and everyday objects worldwide. Your job is to identify EXACTLY what product the user is looking for, even when described vaguely, creatively, or in any language.
User request (in ${lang}): "${query}"
Think carefully:
- What is the user REALLY looking for?
- Identify the exact product, brand, or item even if described indirectly
- Consider cultural references, movie props, celebrity items, objects seen in the street
- If the user describes an object physically, identify what it is

Examples:
- "round black and white cookie with cream inside" → {"keywords": "Oreo cookies", "category": "Grocery"}
- "cadeau pour ma mère qui aime cuisiner" → {"keywords": "cooking gifts for women kitchen tools", "category": "Kitchen"}
- "the thing MacGyver uses to fix everything" → {"keywords": "duct tape", "category": "Tools"}
- "bracelet en pierre noire brillante" → {"keywords": "black obsidian bracelet gemstone", "category": "Clothing"}
- "lunettes de Macron for sure" → {"keywords": "Vuarnet sunglasses men", "category": "Clothing"}
- "jouet peluche qui dit hello" → {"keywords": "talking plush toy hello", "category": "Toys"}
- "most iconic item Casino Royale James Bond" → {"keywords": "Casino Royale playing cards James Bond", "category": "Toys"}
Critical rules for identifying products:
- ALWAYS identify the core product first from physical/functional description, THEN add modifiers
- Ignore indirect hints like "starts with O/A/B", "I think it's called...", "you know the thing..." → identify from description only
- Size/quantity modifiers: only add if user clearly wants them ("big pack" → add "bulk pack", "family size" → add "family size", "small" → add "mini" or "travel size")
- Cultural/movie/celebrity references: identify the exact item (actor's prop, character's tool, celebrity's accessory)
- Vague descriptions of objects seen in real life: focus on material + shape + function + color to identify
- If user asks for a gift: identify the recipient's interest first, then find best matching product
- If user describes a sensation or need ("something to sleep better", "something to stop forgetting"): identify the product category that solves it
- Brand hints: if user clearly names a brand, use it. If they hint at it, ignore the hint and identify from description
- Multiple products: if user clearly wants several items, reflect that in keywords
- Slang, humor, or creative descriptions: take them seriously and identify the real product behind them
Respond ONLY with a JSON object, no explanation:
{"keywords": "optimal search keywords in english", "category": "Amazon category"}
Valid categories: All, Electronics, Clothing, Kitchen, Sports, Books, Toys, Beauty, Garden, Automotive, Health, Music, Tools, Grocery`
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    return { keywords: query, category: 'All' };
  }
}

async function searchAmazon(optimizedQuery, category, domain, tag) {
  const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
  const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
  if (!ACCESS_KEY || !SECRET_KEY) {
    return [{
      title: "Voir sur Amazon : " + optimizedQuery,
      price: "—",
      rating: "",
      image: "",
      url: `https://www.${domain}/s?k=${encodeURIComponent(optimizedQuery)}&tag=${tag}`,
      source: "amazon",
    }];
  }
  try {
    const payload = {
      Keywords: optimizedQuery,
      Resources: ['Images.Primary.Medium', 'ItemInfo.Title', 'Offers.Listings.Price', 'CustomerReviews.StarRating'],
      SearchIndex: category,
      ItemCount: 3,
      PartnerTag: tag,
      PartnerType: 'Associates',
      Marketplace: `www.${domain}`,
    };
    const response = await fetch(`https://webservices.${domain}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'Content-Encoding': 'amz-1.0',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    const items = data.SearchResult?.Items || [];
    return items.map(function(item) {
      return {
        title: item.ItemInfo?.Title?.DisplayValue || 'Produit Amazon',
        price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Voir prix',
        rating: item.CustomerReviews?.StarRating?.DisplayValue
          ? '★'.repeat(Math.round(item.CustomerReviews.StarRating.DisplayValue)) + ' ' + item.CustomerReviews.StarRating.DisplayValue
          : '',
        reviewCount: item.CustomerReviews?.Count?.DisplayValue || '',
        image: item.Images?.Primary?.Medium?.URL || '',
        url: `https://www.${domain}/dp/${item.ASIN}?tag=${tag}`,
        source: "amazon",
      };
    });
  } catch (err) {
    return [];
  }
}

async function searchEbay(optimizedQuery, lang) {
  const APP_ID = process.env.EBAY_APP_ID;
  const CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID;
  if (!APP_ID) return [];
  try {
    const marketplace = ebayMarketMap[lang] || 'EBAY_US';
    const shortQuery = optimizedQuery.split(' ').slice(0, 4).join(' ');
    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(shortQuery)}&limit=3`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${await getEbayToken()}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplace,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const items = data.itemSummaries || [];
    return items.map(function(item) {
      const baseUrl = item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`;
      const affiliateUrl = CAMPAIGN_ID
        ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=${CAMPAIGN_ID}&toolid=10050`
        : baseUrl;
      return {
        title: item.title || 'Produit eBay',
        price: item.price ? item.price.value + ' ' + item.price.currency : 'Voir prix',
        rating: item.seller?.feedbackScore ? '⭐ ' + item.seller.feedbackScore : '',
        condition: item.condition || '',
        image: item.image?.imageUrl || '',
        url: affiliateUrl,
        source: "ebay",
      };
    });
  } catch (err) {
    return [];
  }
}

async function getEbayToken() {
  const APP_ID = process.env.EBAY_APP_ID;
  const CERT_ID = process.env.EBAY_CERT_ID;
  console.log('EBAY APP_ID:', APP_ID ? 'ok' : 'manquant');
  console.log('EBAY CERT_ID:', CERT_ID ? 'ok' : 'manquant');
  if (!APP_ID || !CERT_ID) return '';
  try {
    const credentials = Buffer.from(`${APP_ID}:${CERT_ID}`).toString('base64');
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    });
    const data = await response.json();
    return data.access_token || '';
  } catch (err) {
    return '';
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const lang = searchParams.get('lang') || 'en';
  const { domain, tag } = domainMap[lang] || domainMap.en;

  const aiResult = await reformulateWithAI(query, lang);
  const optimizedQuery = aiResult.keywords || query;
  const category = aiResult.category || 'All';

  const [amazonResults, ebayResults] = await Promise.all([
    searchAmazon(optimizedQuery, category, domain, tag),
    searchEbay(optimizedQuery, lang),
  ]);

  return Response.json({
    amazon: amazonResults,
    ebay: ebayResults,
  });
}