export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const lang = searchParams.get('lang') || 'en';

  const domainMap = {
    fr: { domain: 'amazon.fr', tag: 'thepuresearch-21' },
    en: { domain: 'amazon.com', tag: 'thepuresearch-20' },
    de: { domain: 'amazon.de', tag: 'thepuresearch-21' },
    es: { domain: 'amazon.es', tag: 'thepuresearch-21' },
    it: { domain: 'amazon.it', tag: 'thepuresearch-21' },
    pt: { domain: 'amazon.com.br', tag: 'thepuresearch-21' },
    nl: { domain: 'amazon.nl', tag: 'thepuresearch-21' },
    ja: { domain: 'amazon.co.jp', tag: 'thepuresearch-21' },
  };

  const { domain, tag } = domainMap[lang] || domainMap.en;

  const PAAPI_HOST = `webservices.${domain}`;
  const PAAPI_REGION = regionMap[lang] || 'us-east-1';
  const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
  const SECRET_KEY = process.env.AMAZON_SECRET_KEY;

  // Pendant l'attente des clés Amazon, on retourne des données de test
  if (!ACCESS_KEY || !SECRET_KEY) {
    return Response.json({
      results: [
        {
          title: "Résultats Amazon bientôt disponibles — clés API en attente",
          price: "—",
          rating: "★★★★★",
          image: "https://via.placeholder.com/150",
          url: `https://www.${domain}/s?k=${encodeURIComponent(query)}&tag=${tag}`,
        }
      ]
    });
  }

  // Appel Amazon PA API (activé dès que tu as tes clés)
  try {
    const payload = {
      Keywords: query,
      Resources: [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating',
      ],
      SearchIndex: 'All',
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

    const results = items.map(item => ({
      title: item.ItemInfo?.Title?.DisplayValue || 'Produit Amazon',
      price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Voir prix',
      rating: item.CustomerReviews?.StarRating?.DisplayValue
        ? '★'.repeat(Math.round(item.CustomerReviews.StarRating.DisplayValue)) + ' ' + item.CustomerReviews.StarRating.DisplayValue
        : '',
      image: item.Images?.Primary?.Medium?.URL || '',
      url: `https://www.${domain}/dp/${item.ASIN}?tag=${tag}`,
    }));

    return Response.json({ results });
  } catch (err) {
    return Response.json({ results: [], error: err.message });
  }
}

const regionMap = {
  fr: 'eu-west-1',
  de: 'eu-west-1',
  es: 'eu-west-1',
  it: 'eu-west-1',
  nl: 'eu-west-1',
  pt: 'sa-east-1',
  ja: 'us-west-2',
  en: 'us-east-1',
};