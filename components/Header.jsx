import React from "react";
import Link from "next/link";
import logoImg from "@/assets/cube.png";
import Image from "next/image";
import styles from "./Header.module.css";

export const Header = () => {
  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} href="/">
        <Image
          className={styles.logo}
          src={logoImg}
          alt="A Good Place to Learn"
        />
        NextLevel Course
      </Link>

      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/courses">Browse Course</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
