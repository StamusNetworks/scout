Feature('Updating deeplinks');

Before(async ({ I }) => {
  I.sendPostRequest('http://localhost:3000/rest/rules/deeplink/reset');
  I.amOnPage('/deeplinks');
});

Scenario('Disabling / enabling a deeplink', async ({ I }) => {
  within('tbody > tr:nth-child(1)', () => {
    I.click('button[role="switch"]');
    I.wait(2); // Wait for optimistic update to be secured by network response
    I.seeElement('button[role="switch"][data-state="unchecked"]');
  });
});

Scenario('Updating a deeplink', async ({ I }) => {
  I.click('tbody > tr:nth-child(8) button[role="edit"]');
  I.fillField('Name', 'Updated deeplink');
  I.fillField('Template', 'https://www.updated-link.com');
  I.click('Submit');
  within('tbody > tr:nth-child(8)', () => {
    I.see('Updated deeplink');
    I.see('https://www.updated-link.com');
  });
});
