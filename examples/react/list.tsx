import React from "https://esm.sh/react@17.0.2?dev"
import styles from "./list.css";

const doggos = [...new Array(12)].map((_, index) => ({
  id: index + 1,
  alt: "A cute doggo",
  src: `https://placedog.net/400/225?id=${index + 1}`,
}));

export const List = () => {
  return (
    <section className={styles.section}>
      <ol className={styles.list}>
        {doggos.map((doggo: { id: number; src: string; alt: string }) => (
          <li className={styles.tile} key={doggo.id}>
            <a className={styles.card} href={doggo.src}>
              <div className={styles.image_container}>
                <img
                  className={styles.image}
                  src={doggo.src}
                  alt={doggo.alt}
                  loading="lazy"
                />
              </div>
              <div className={styles.description}>{`ID: ${doggo.id}`}</div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
};
