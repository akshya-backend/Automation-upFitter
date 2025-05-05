# City Upfitter Scraping Automation

This project automates the process of scraping upfitter companies for multiple cities using **Puppeteer Cluster** for concurrent scraping, **Serper API** for searching upfitters, and **Google Sheets** for storing the results. It is designed to be scalable and efficient, with rate limiting and custom filtering to avoid irrelevant results.

## Features
- **Puppeteer Cluster** for scalable and concurrent web scraping
- **Serper API** to search for upfitters
- **Google Sheets Integration** for storing results
- **Custom Filtering** to exclude irrelevant domains and file types
- **Rate-Limiting** and **Delays** to avoid hitting external services too frequently

## Prerequisites

Before you can run this project, you will need to have the following installed:

- **Node.js** (v16 or higher)
- **npm** (or **yarn**)
- **Google Sheets API credentials** for storing results
- **Puppeteer Cluster** and **Stealth Plugin** for web scraping

### Setup Instructions

#### 1. Clone the Repository

```bash
https://github.com/akshya-backend/automation-upfitter-scraper.git
cd city-upfitter-scraping
