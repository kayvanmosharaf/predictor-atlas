import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>About PredictorAtlas</h1>

      <section className={styles.section}>
        <h2>What is PredictorAtlas?</h2>
        <p>
          PredictorAtlas is a prediction platform that applies game theory — the
          mathematical study of strategic decision-making — to forecast real-world
          events. From elections and economic shifts to wars and sporting events,
          we model the strategic interactions between key players to identify the
          most likely outcomes.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Why Game Theory?</h2>
        <p>
          Most prediction platforms rely purely on crowd sentiment or statistical
          trends. PredictorAtlas goes deeper by analyzing the <em>strategic incentives</em>{" "}
          of the actors involved. Using concepts like Nash equilibrium, dominant
          strategies, and payoff matrices, we model how rational actors will
          behave — and where outcomes will settle.
        </p>
      </section>

      <section className={styles.section}>
        <h2>How It Works</h2>
        <ul className={styles.list}>
          <li>
            <strong>Strategic Modeling:</strong> For each prediction, we identify
            the key players, their available strategies, and their payoffs.
          </li>
          <li>
            <strong>Nash Equilibrium Analysis:</strong> We compute the Nash
            equilibria — the stable outcomes where no player benefits from
            changing their strategy unilaterally.
          </li>
          <li>
            <strong>Crowd Forecasting:</strong> Users submit their own confidence
            levels on each outcome, combining collective intelligence with
            analytical models.
          </li>
          <li>
            <strong>Resolution Tracking:</strong> Once events resolve, we compare
            predictions to reality to continuously improve our models.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Who Is John Nash?</h2>
        <p>
          John Forbes Nash Jr. (1928–2015) was an American mathematician whose
          work on non-cooperative game theory earned him the Nobel Prize in
          Economics in 1994. His concept of <strong>Nash equilibrium</strong> — a
          state where each player&apos;s strategy is optimal given the strategies of
          all other players — is the foundation of modern strategic analysis and
          the core engine behind PredictorAtlas.
        </p>
      </section>
    </div>
  );
}
