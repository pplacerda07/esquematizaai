import React from 'react';
import styles from './styles.module.css';

const courses = [
  { tag: 'Direito Constitucional', title: 'OAB 1ª Fase - Esquematizado', oldPrice: 'R$ 597', newPrice: 'R$ 297' },
  { tag: 'Direito Penal', title: 'Teoria do Crime Descomplicada', oldPrice: 'R$ 497', newPrice: 'R$ 197' },
  { tag: 'Direito Civil', title: 'Direito de Família na Prática', oldPrice: 'R$ 397', newPrice: 'R$ 147' },
];

export default function FeaturedCourses() {
  return (
    <section className={styles.coursesSection} id="cursos">
      <span className={styles.sectionTag}>Cursos</span>
      <h2 className={styles.title}>
        Nossos Cursos em <span className={styles.titleAccent}>Destaque</span>
      </h2>
      
      <div className={styles.grid}>
        {courses.map((course, idx) => (
          <div key={idx} className={styles.card}>
            <span className={styles.badge}>{course.tag}</span>
            <h3 className={styles.courseTitle}>{course.title}</h3>
            <div className={styles.stars}>★★★★★</div>
            
            <div className={styles.priceContainer}>
              <span className={styles.oldPrice}>{course.oldPrice}</span>
              <span className={styles.currentPrice}>{course.newPrice}</span>
            </div>
            
            <button className={styles.btnEnroll}>Matricular →</button>
          </div>
        ))}
      </div>
    </section>
  );
}
