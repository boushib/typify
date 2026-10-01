import styles from "./Footer.module.sass"

const Footer = () => (
  <footer className={styles.footer}>
    <div className={`container ${styles.inner}`}>
      <span>typify · practice makes fast</span>
      <a href="https://github.com/boushib/typify" target="_blank" rel="noreferrer">
        github
      </a>
    </div>
  </footer>
)

export default Footer
