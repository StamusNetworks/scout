// in this file you can append custom step methods to 'I' object

export = function () {
  return actor({
    sendPostRequest: async function (url, data = {}) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    openEventValueMenu: async function (value: string) {
      this.rightClick(`div[data-testid="event-value"]:text-is("${value}")`);
    },
    createDeeplink: async function ({
      name,
      template,
      all,
      entities,
    }: CreateDeeplink) {
      this.amOnPage('/deeplinks');
      this.click('button:has-text("Create deeplink")');
      this.fillField('Name', name);
      this.fillField('Template', template);
      if (entities?.length) {
        this.click('button[name="entities"]');
        entities.forEach((entity) => {
          this.click(
            `div[data-radix-popper-content-wrapper] span:text-is("${entity}")`,
          );
        });
        this.click(
          `div[data-radix-popper-content-wrapper] div[data-value="Close"]`,
        );
      }
      if (all) {
        this.click('All filter types');
      }
      this.click('Submit');
    },
  });
};

type CreateDeeplink = {
  name: string;
  template: string;
} & (
  | { all: true; entities?: string[] | undefined }
  | { all: false; entities: string[] }
);
