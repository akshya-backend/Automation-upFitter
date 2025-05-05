const { faker } = require('@faker-js/faker');

function getUniqueDomainLinks(data) {
    const seenDomains = new Set();
    const result = [];
  
    const disallowedDomains = [
      'linkedin.com', 'facebook.com', 'instagram.com', 'yelp.com', 'glassdoor.com',
      'twitter.com', 'pinterest.com', 'wikipedia.org', 'youtube.com', 'reddit.com',
      'indeed.com', 'mapquest.com', 'angieslist.com', 'bbb.org', 'craigslist.org',
      'yellowpages.com', 'foursquare.com', 'tripadvisor.com', 'zillow.com', 'freelancer.com',
      'upwork.com', 'fiverr.com',  'quora.com', 'tumblr.com', 'blogger.com',"reddit.com",
      'pinterest.com', 'craigslist.org', 'yelp.com', 'yellowpages.com', 'angieslist.com',
      'indiamart','justdial'
    ];
  
    const badExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.xls', '.xlsx', 
      '.ppt', '.zip', '.exe', '.svg', '.webp', '.bmp'
    ];
  
    for (const item of data) {
      try {
        
        const url = new URL(item.link);
        const domain = url.hostname.replace(/^www\./, '');
  
        // Skip disallowed domains
        if (disallowedDomains.includes(domain)) continue;
  
        // Skip bad file extensions
        if (badExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext))) continue;
  
        if (!seenDomains.has(domain)) {
          seenDomains.add(domain);
          result.push(item);
        }
      } catch {
        continue;
      }
    }
      seenDomains.clear();
    console.log(`Filtered ${result.length} unique results,${result}`);
    
    return result;

  }
  

  function generateMockCompany() {
    return {
      name: faker.company.name(),
      website: faker.internet.url(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      owner:faker.person.fullName(),
      city: faker.location.city(),
      description: faker.company.catchPhrase(),
    };
  }
  


module.exports = {
    getUniqueDomainLinks,
    generateMockCompany
  };


