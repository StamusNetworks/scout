Feature('Updating @deeplinks');

Before(async ({ I }) => {
  I.sendPostRequest('http://localhost:3000/rest/rules/deeplink/reset');
  I.amOnPage('/deeplinks');
});

Scenario('Deleting a user defined deeplink', async ({ I }) => {
  I.see('Total items count: 9');
  I.click('tbody > tr:nth-child(8) button[role="delete"]');
  I.click('Confirm delete');
  I.see('Total items count: 8');
});

Scenario('Cannot delete a system defined deeplink', async ({ I }) => {
  I.dontSeeElement('tbody > tr:nth-child(1) button[role="delete"]');
});
