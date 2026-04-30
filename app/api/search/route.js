const domainMap = {
  fr: { domain: 'amazon.fr', tag: 'thepuresearch-20' },
  en: { domain: 'amazon.com', tag: 'thepuresearch-20' },
  de: { domain: 'amazon.de', tag: 'thepuresearch-20' },
  es: { domain: 'amazon.es', tag: 'thepuresearch-20' },
  it: { domain: 'amazon.it', tag: 'thepuresearch-20' },
  pt: { domain: 'amazon.com.br', tag: 'thepuresearch-20' },
  nl: { domain: 'amazon.nl', tag: 'thepuresearch-20' },
  ja: { domain: 'amazon.co.jp', tag: 'thepuresearch-20' },
  pl: { domain: 'amazon.pl', tag: 'thepuresearch-20' },
  sv: { domain: 'amazon.se', tag: 'thepuresearch-20' },
  tr: { domain: 'amazon.com.tr', tag: 'thepuresearch-20' },
};

const regionMap = {
  fr: 'eu-west-1',
  de: 'eu-west-1',
  es: 'eu-west-1',
  it: 'eu-west-1',
  nl: 'eu-west-1',
  pl: 'eu-west-1',
  sv: 'eu-west-1',
  pt: 'sa-east-1',
  ja: 'us-west-2',
  tr: 'us-east-1',
  en: 'us-east-1',
};

async function reformulateWithAI(query, lang) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { keywords: query, category: 'All' };

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
        messages: [
          {
            role: 'user',
            content: `You are a shopping search expert. Convert this user request into optimal Amazon search keywords in English.

User request (in ${lang}): "${query}"

Respond ONLY with a JSON object like this, no explanation:
{"keywords": "optimal search keywords in english", "category": "Amazon category"}

Valid categories: All, Electronics, Clothing, Kitchen, Sports, Books, Toys, Beauty, Garden, Automotive, Health, Music, Tools, Grocery

Example: {"keywords": "waterproof bluetooth speaker outdoor", "category": "Electronics"}`
          }
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    return { keywords: query, category: 'All' };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const lang = searchParams.get('lang') || 'en';

  const { domain, tag } = domainMap[lang] || domainMap.en;

  const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
  const SECRET_KEY = process.env.AMAZON_SECRET_KEY;

  // Reformulation IA
  const aiResult = await reformulateWithAI(query, lang);
  const optimizedQuery = aiResult.keywords || query;
  const category = aiResult.category || 'All';

  // Sans clés Amazon → lien de recherche direct avec requête optimisée par IA
  if (!ACCESS_KEY || !SECRET_KEY) {
    return Response.json({
      results: [
        {
          title: "Cliquez pour voir les résultats Amazon pour : " + optimizedQuery,
          price: "—",
          rating: "",
          image: "https://via.placeholder.com/150x150?text=Amazon",
          url: `https://www.${domain}/s?k=${encodeURIComponent(optimizedQuery)}&tag=${tag}`,
        }
      ]
    });
  }

  // Avec clés Amazon PA API
  try {
    const PAAPI_HOST = `webservices.${domain}`;
    const PAAPI_REGION = regionMap[lang] || 'us-east-1';

    const payload = {
      Keywords: optimizedQuery,
      Resources: [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating',
      ],
      SearchIndex: category,
      ItemCount: 8,
      PartnerTag: tag,
      PartnerType: 'Associates',
      Marketplace: `www.${domain}`,
    };

    const response = await fetch(`https://${PAAPI_HOST}/paapi5/searchitems`, {
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

    const results = items.map(function(item) {
      return {
        title: item.ItemInfo?.Title?.DisplayValue || 'Produit Amazon',
        price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Voir prix',
        rating: item.CustomerReviews?.StarRating?.DisplayValue
          ? '★'.repeat(Math.round(item.CustomerReviews.StarRating.DisplayValue)) + ' ' + item.CustomerReviews.StarRating.DisplayValue
          : '',
        image: item.Images?.Primary?.Medium?.URL || '',
        url: `https://www.${domain}/dp/${item.ASIN}?tag=${tag}`,
      };
    });

    return Response.json({ results });
  } catch (err) {
    return Response.json({ results: [], error: err.message });
  }
}