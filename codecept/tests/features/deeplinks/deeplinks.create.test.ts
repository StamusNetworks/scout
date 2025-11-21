Feature('Creating @deeplinks');

Before(async ({ I }) => {
  I.sendPostRequest('http://localhost:3000/rest/rules/deeplink/reset');
});

Scenario('Creating a deeplink with specific entities', async ({ I }) => {
  I.createDeeplink({
    name: 'Test deeplink SHA256/IP',
    template: 'https://www.google.com/?q={{ value }}',
    all: false,
    entities: ['SHA256', 'IP'],
  });
  within({ xpath: `//tr[td[contains(., "Test deeplink SHA256/IP")]]` }, () => {
    I.see('https://www.google.com/?q={{ value }}');
    I.see('SHA256');
    I.see('IP');
  });
  I.amOnPage('/explorer');
  I.openEventValueMenu('216.24.57.3');
  within('div[data-radix-popper-content-wrapper]', () => {
    I.click('div[role="menuitem"]:text-is("External links")');
    I.see('Test deeplink SHA256/IP', 'a[role="menuitem"]');
  });
});

Scenario('Creating a deeplink for all entities', async ({ I }) => {
  I.createDeeplink({
    name: 'Test deeplink all',
    template: 'https://www.google.com/?q={{ value }}',
    all: true,
  });
  within({ xpath: `//tr[td[contains(., "Test deeplink all")]]` }, () => {
    I.see('https://www.google.com/?q={{ value }}');
    I.see('All');
  });
  I.amOnPage('/explorer');
  I.openEventValueMenu('Unknown Traffic');
  within('div[data-radix-popper-content-wrapper]', () => {
    I.click('div[role="menuitem"]:text-is("External links")');
    I.see('Test deeplink all', 'a[role="menuitem"]');
  });
});
