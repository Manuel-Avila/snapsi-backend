import db from "../config/database.js";

const statements = [
  `
    INSERT INTO users (username, email, password, bio, gender) VALUES
    ('dev_jane', 'jane@test.com', 'dasfdsaf', 'Hola, soy Jane, desarrolladora de software.', 'female'),
    ('photo_chris', 'chris@test.com', 'dasfdsaf', 'Fotógrafo de paisajes y retratos.', 'male'),
    ('foodie_sam', 'sam@test.com', 'dasfdsaf', 'Amante de la buena comida. Comparto mis recetas.', 'other'),
    ('travel_alex', 'alex@test.com', 'dasfdsaf', 'Explorando el mundo, un destino a la vez.', 'male');
  `,
  `
    INSERT INTO posts (user_id, image_url, caption) VALUES
    (1, 'https://picsum.photos/seed/code/800/600', 'Nuevo setup de programación. ¡Listo para codificar! 💻'),
    (2, 'https://picsum.photos/seed/mountain/800/600', 'Amanecer en las montañas. Una vista increíble.'),
    (2, 'https://picsum.photos/seed/portrait/800/600', 'Sesión de retratos en el estudio.'),
    (3, 'https://picsum.photos/seed/pizza/800/600', 'La mejor pizza que he probado. 🍕');
  `,
  `
    INSERT INTO followers (follower_id, following_id) VALUES
    (1, 2), -- Jane sigue a Chris
    (1, 3), -- Jane sigue a Sam
    (2, 1), -- Chris sigue a Jane
    (3, 1), -- Sam sigue a Jane
    (3, 2), -- Sam sigue a Chris
    (4, 3); -- Alex sigue a Sam
  `,
  `
    INSERT INTO comments (post_id, user_id, comment_text) VALUES
    (2, 1, '¡Qué foto tan espectacular, Chris!'),
    (4, 2, '¡Se ve deliciosa! ¿Dónde es?'),
    (1, 3, '¡Me encanta tu setup! Muy limpio y organizado.');
  `,
  `
    INSERT INTO post_likes (post_id, user_id) VALUES
    (1, 2), -- Chris le da like al post de Jane
    (1, 3), -- Sam le da like al post de Jane
    (2, 1), -- Jane le da like al post de Chris
    (2, 3), -- Sam le da like al post de Chris
    (2, 4), -- Alex le da like al post de Chris
    (4, 1); -- Jane le da like al post de Sam
  `,
];

(async () => {
  const connection = await db.getConnection();

  try {
    console.log("🌱 Starting database seeding...");

    await connection.beginTransaction();

    for (const statement of statements) {
      await connection.query(statement);
    }

    await connection.commit();

    console.log("✅ Database seeding completed successfully.");
  } catch (err) {
    console.error("❌ Database seeding failed:", err);
    await connection.rollback();
  } finally {
    connection.release();
    process.exit();
  }
})();
