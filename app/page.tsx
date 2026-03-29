import Link from "next/link";
import styles from "./page.module.css";

const categories = [
  {
    icon: "🗳️",
    title: "Elections & Politics",
    description:
      "Predict election outcomes, policy shifts, and political dynamics using strategic interaction models.",
  },
  {
    icon: "📉",
    title: "Economics & Markets",
    description:
      "Forecast recessions, market movements, and economic policy outcomes through game-theoretic analysis.",
  },
  {
    icon: "🌍",
    title: "Geopolitics & Conflicts",
    description:
      "Analyze war outcomes, diplomatic negotiations, and international relations through Nash equilibrium.",
  },
  {
    icon: "🏆",
    title: "Sports",
    description:
      "Predict game results, tournament brackets, and player strategies using payoff matrices.",
  },
  {
    icon: "💡",
    title: "Technology",
    description:
      "Forecast tech adoption, platform wars, and industry disruption through strategic competition models.",
  },
  {
    icon: "🔮",
    title: "Other Events",
    description:
      "Any major event with strategic players — from awards shows to corporate M&A.",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroContent}>
          <p className={styles.heroSub}>Game Theory Meets Prediction</p>
          <h1 className={styles.heroTitle}>
            Predict the Future with Strategic Analysis
          </h1>
          <p className={styles.heroText}>
            PredictorAtlas uses Nash equilibrium and game theory models to
            forecast elections, economic shifts, geopolitical conflicts, and
            sporting events.
          </p>
          <Link href="/predictions" className={styles.heroBtn}>
            Explore Predictions
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <h2 className={styles.sectionTitle}>What We Predict</h2>
        <p className={styles.sectionSub}>
          Strategic analysis across every domain
        </p>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div key={cat.title} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSub}>
          From strategic modeling to crowd forecasting
        </p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Identify Players</h3>
            <p>
              We map out the key actors, their goals, and available strategies
              for each event.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Build the Model</h3>
            <p>
              Construct payoff matrices and identify Nash equilibria to find
              stable strategic outcomes.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Crowd Forecast</h3>
            <p>
              Users submit their confidence levels on outcomes, combining
              collective intelligence with game theory.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Track & Resolve</h3>
            <p>
              Follow predictions in real-time and see how game theory models
              compare to actual outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerName}>PredictorAtlas</p>
        <div className={styles.footerLinks}>
          <Link href="/predictions">Predictions</Link>
          <Link href="/about">About</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} PredictorAtlas. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
