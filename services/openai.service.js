const openai = require('../config/openai.config');


async function isUpfitterBusiness(title, snippet, link) {
  const prompt = `
  You are a strict filter for business websites.
  
  Given a link with its title and description, decide **only** if it belongs to a company that directly performs vehicle upfitting services — such as police car outfitting, fleet vehicle installations, van conversions, or commercial/emergency vehicle customization.
  
  The site must clearly belong to a **business that performs upfitting work**, not directories, review platforms, job boards, articles, marketplaces, forums, or resellers.
  
  Examples of what should be marked as **invalid**:
  - Godaddy parked domains or builder pages
  - LinkedIn, Glassdoor, Yelp, or any job/review site
  - News articles, Wikipedia, blogs
  - Dealer listings or parts suppliers that don't do installations
  - Product-only catalog pages
  
  Examples of what should be **valid**:
  - A company website showing upfitting services or completed fleet builds
  - Service providers with installation galleries, contact info, and service offerings
  
  Now evaluate:
  
  Title: ${title}
  Link: ${link}
  Snippet: ${snippet}
  
  Reply strictly with one of:
  - valid
  - invalid
  
  Answer only with: valid or invalid.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  return response.choices[0].message.content.trim().toLowerCase() === "valid";
}

async function extractCompanyDetails({ scrapedText, title, snippet, link }) {
  const prompt = `
I have the following text from a company's website:

"${scrapedText}"

Please extract the following details:
1. Company Name
2. Website URL
3. Phone Number
4. Email Address
5. Address (Full)
6. Owner Name
7. City
8. Description of the company

Format your response like this:
{
  "name": "<Company Name>",
  "website": "<Website URL>",
  "phone": "<Phone Number>",
  "email": "<Email Address>",
  "address": "<Full Address>",
  "owner": "<Owner Name>",
  "city": "<City>",
  "description": "<Description>"
}
If any field is missing or unclear, return "N/A".
Only return this JSON object. Do not add any extra text.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business data extractor. ONLY return a valid JSON object with double quotes. No markdown or extra text.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
    });

    let content = response.choices[0].message.content.trim();

    const jsonMatch = content.match(/{[\s\S]*}/);
    if (!jsonMatch) throw new Error("No valid JSON block found in GPT response");

    let jsonText = jsonMatch[0];

    jsonText = jsonText
      .replace(/[“”]/g, '"')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/\\"/g, '"');

    const extractedData = JSON.parse(jsonText);

    // Fallbacks
    extractedData.name = extractedData.name === 'N/A' ? title || 'N/A' : extractedData.name;
    extractedData.description = extractedData.description === 'N/A' ? snippet || 'N/A' : extractedData.description;
    extractedData.website = extractedData.website === 'N/A' ? link || 'N/A' : extractedData.website;

    return extractedData;

  } catch (error) {
    console.error('❌ Error extracting company details:', error.message);

    return {
      name: title || 'N/A',
      website: link || 'N/A',
      phone: 'N/A',
      email: 'N/A',
      address: 'N/A',
      owner: 'N/A',
      city: 'N/A',
      description: snippet || 'N/A'
    };
  }
}

module.exports = {
  extractCompanyDetails,
  isUpfitterBusiness,
};
