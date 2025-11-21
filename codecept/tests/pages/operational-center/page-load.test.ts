Feature('Operational Center');

Scenario('Page load', async ({ I }) => {
  I.amOnPage('/operational-center');
  //   I.waitForText('Operational Center', 10, 'h1');
  I.see('Operational Center', 'h1');
});
