import styles from './htmlCodeDisplay.module.css';

export const HtmlCodeDisplay = ({
  key,
  innerHtml,
}: {
  key?: string | number;
  innerHtml: string;
}) => {
  return (
    <div
      key={key}
      className={styles.code}
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
};
