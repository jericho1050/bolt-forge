-- Insert core skills and technologies
INSERT INTO skills (name, category, description, icon) VALUES
  ('React', 'Frontend', 'JavaScript library for building user interfaces', '⚛️'),
  ('Vue.js', 'Frontend', 'Progressive JavaScript framework', '💚'),
  ('Angular', 'Frontend', 'Platform for building mobile and desktop web applications', '🅰️'),
  ('TypeScript', 'Frontend', 'Typed superset of JavaScript', '🔷'),
  ('JavaScript', 'Frontend', 'Programming language for web development', '🟨'),
  ('HTML/CSS', 'Frontend', 'Markup and styling languages for web', '🎨'),
  ('Tailwind CSS', 'Frontend', 'Utility-first CSS framework', '🎨'),
  
  ('Node.js', 'Backend', 'JavaScript runtime for server-side development', '🟢'),
  ('Python', 'Backend', 'High-level programming language', '🐍'),
  ('Java', 'Backend', 'Object-oriented programming language', '☕'),
  ('PHP', 'Backend', 'Server-side scripting language', '🐘'),
  ('C#', 'Backend', 'Microsoft programming language', '🔷'),
  ('Go', 'Backend', 'Programming language developed by Google', '🐹'),
  ('Rust', 'Backend', 'Systems programming language', '🦀'),
  
  ('PostgreSQL', 'Database', 'Advanced open source relational database', '🐘'),
  ('MongoDB', 'Database', 'NoSQL document database', '🍃'),
  ('MySQL', 'Database', 'Popular relational database', '🐬'),
  ('Redis', 'Database', 'In-memory data structure store', '🔴'),
  ('Supabase', 'Database', 'Open source Firebase alternative', '⚡'),
  
  ('AWS', 'Cloud', 'Amazon Web Services cloud platform', '☁️'),
  ('Google Cloud', 'Cloud', 'Google Cloud Platform', '☁️'),
  ('Azure', 'Cloud', 'Microsoft Azure cloud platform', '☁️'),
  ('Docker', 'DevOps', 'Containerization platform', '🐳'),
  ('Kubernetes', 'DevOps', 'Container orchestration platform', '⚓'),
  
  ('React Native', 'Mobile', 'Framework for building native mobile apps', '📱'),
  ('Flutter', 'Mobile', 'Google UI toolkit for mobile apps', '🦋'),
  ('Swift', 'Mobile', 'Programming language for iOS development', '🍎'),
  ('Kotlin', 'Mobile', 'Programming language for Android development', '🤖'),
  
  ('Machine Learning', 'AI/ML', 'Artificial intelligence and machine learning', '🤖'),
  ('TensorFlow', 'AI/ML', 'Open source machine learning framework', '🧠'),
  ('PyTorch', 'AI/ML', 'Machine learning library', '🔥'),
  ('OpenAI API', 'AI/ML', 'AI and language model APIs', '🤖'),
  
  ('Solidity', 'Blockchain', 'Programming language for Ethereum smart contracts', '⛓️'),
  ('Web3', 'Blockchain', 'Decentralized web technologies', '🌐'),
  ('Ethereum', 'Blockchain', 'Blockchain platform for smart contracts', '💎'),
  ('Algorand', 'Blockchain', 'Pure proof-of-stake blockchain', '🔺'),
  
  ('UI/UX Design', 'Design', 'User interface and experience design', '🎨'),
  ('Figma', 'Design', 'Collaborative design tool', '🎨'),
  ('Adobe Creative Suite', 'Design', 'Creative software applications', '🎨'),
  ('Sketch', 'Design', 'Digital design toolkit', '✏️')
ON CONFLICT (name) DO NOTHING;

-- Insert achievement badges
INSERT INTO badges (name, description, icon, category, criteria) VALUES
  ('Fast Deliverer', 'Completed 95% of projects before deadline', '🚀', 'Performance', '{"metric": "on_time_delivery", "threshold": 0.95}'),
  ('Code Quality Master', 'Maintained 4.8+ star rating across projects', '✨', 'Quality', '{"metric": "average_rating", "threshold": 4.8}'),
  ('Team Player', 'Excellent collaboration and communication skills', '🤝', 'Collaboration', '{"metric": "collaboration_score", "threshold": 4.5}'),
  ('Problem Solver', 'Successfully solved complex technical challenges', '🧩', 'Technical', '{"metric": "complexity_solved", "threshold": 5}'),
  ('First Project', 'Completed your first micro-internship', '🎯', 'Milestone', '{"metric": "projects_completed", "threshold": 1}'),
  ('Veteran Developer', 'Completed 10+ successful projects', '🏆', 'Milestone', '{"metric": "projects_completed", "threshold": 10}'),
  ('Top Rated', 'Achieved 5-star rating on multiple projects', '⭐', 'Quality', '{"metric": "five_star_projects", "threshold": 3}'),
  ('Quick Responder', 'Average response time under 2 hours', '⚡', 'Communication', '{"metric": "response_time_hours", "threshold": 2}'),
  ('Skill Verified', 'Completed skill verification process', '✅', 'Verification', '{"metric": "verified_skills", "threshold": 1}'),
  ('Multi-Tech Expert', 'Proficient in 5+ different technologies', '🔧', 'Technical', '{"metric": "skill_count", "threshold": 5}'),
  ('Client Favorite', 'Received repeat business from clients', '💝', 'Relationship', '{"metric": "repeat_clients", "threshold": 2}'),
  ('Innovation Award', 'Implemented creative solutions in projects', '💡', 'Innovation', '{"metric": "innovation_score", "threshold": 4.5}')
ON CONFLICT (name) DO NOTHING;

-- Note: Sample user profiles and related data will be created when users actually sign up through the application
-- This ensures proper foreign key relationships with Supabase Auth users

-- Insert sample projects (using placeholder company_id that will be updated when real companies sign up)
-- For now, we'll create these without company_id to avoid foreign key issues
INSERT INTO projects (
  title, description, requirements, budget_min, budget_max, 
  duration_days, difficulty, category, status, is_featured, deadline
) VALUES 
  (
    'React E-commerce Cart Component',
    'Build a responsive shopping cart component with local storage persistence and checkout flow integration. The component should handle product additions, removals, quantity updates, and price calculations.',
    'Experience with React hooks, local storage APIs, and responsive design. Knowledge of e-commerce workflows preferred.',
    250.00, 400.00, 5, 'intermediate', 'Frontend', 'open', true,
    (now() + interval '7 days')
  ),
  (
    'Node.js API Authentication System',
    'Implement JWT-based authentication with role-based access control for a SaaS platform. Include user registration, login, password reset, and session management.',
    'Strong experience with Node.js, Express, JWT tokens, and database integration. Security best practices knowledge required.',
    400.00, 600.00, 7, 'advanced', 'Backend', 'open', false,
    (now() + interval '14 days')
  ),
  (
    'AI Chatbot Widget Integration',
    'Create a conversational AI widget that can be embedded into websites with customizable styling. Should integrate with popular AI APIs and provide real-time responses.',
    'Experience with AI/ML APIs, JavaScript widgets, and real-time communication. Knowledge of natural language processing preferred.',
    600.00, 800.00, 14, 'expert', 'AI/ML', 'open', true,
    (now() + interval '21 days')
  ),
  (
    'Mobile App UI Redesign',
    'Modernize the user interface of a React Native app with new design system and smooth animations. Focus on improving user experience and visual appeal.',
    'Experience with React Native, animation libraries, and mobile UI/UX principles. Figma design interpretation skills needed.',
    300.00, 500.00, 7, 'intermediate', 'Mobile', 'open', false,
    (now() + interval '10 days')
  ),
  (
    'Smart Contract Development',
    'Develop and deploy smart contracts for a decentralized marketplace on Ethereum blockchain. Include testing and security audit preparation.',
    'Strong experience with Solidity, Web3 technologies, and blockchain development. Security-first mindset required.',
    800.00, 1200.00, 21, 'expert', 'Blockchain', 'open', true,
    (now() + interval '28 days')
  ),
  (
    'Vue.js Dashboard Components',
    'Create reusable dashboard components with charts and data visualization for analytics platform. Components should be modular and well-documented.',
    'Experience with Vue.js, chart libraries, and data visualization. Component architecture and documentation skills needed.',
    350.00, 550.00, 7, 'intermediate', 'Frontend', 'open', false,
    (now() + interval '14 days')
  )
ON CONFLICT DO NOTHING;

-- Insert project tags for the sample projects
-- We'll use a more robust approach that handles the case where projects might not exist
DO $$
DECLARE
    project_record RECORD;
    skill_record RECORD;
BEGIN
    -- React E-commerce Cart Component tags
    SELECT id INTO project_record FROM projects WHERE title = 'React E-commerce Cart Component' LIMIT 1;
    IF FOUND THEN
        FOR skill_record IN SELECT id FROM skills WHERE name IN ('React', 'JavaScript', 'HTML/CSS') LOOP
            INSERT INTO project_tags (project_id, skill_id, is_required) 
            VALUES (project_record.id, skill_record.id, true)
            ON CONFLICT (project_id, skill_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Node.js API Authentication System tags
    SELECT id INTO project_record FROM projects WHERE title = 'Node.js API Authentication System' LIMIT 1;
    IF FOUND THEN
        FOR skill_record IN SELECT id FROM skills WHERE name IN ('Node.js', 'JavaScript', 'MongoDB') LOOP
            INSERT INTO project_tags (project_id, skill_id, is_required) 
            VALUES (project_record.id, skill_record.id, true)
            ON CONFLICT (project_id, skill_id) DO NOTHING;
        END LOOP;
    END IF;

    -- AI Chatbot Widget Integration tags
    SELECT id INTO project_record FROM projects WHERE title = 'AI Chatbot Widget Integration' LIMIT 1;
    IF FOUND THEN
        FOR skill_record IN SELECT id FROM skills WHERE name IN ('Python', 'OpenAI API', 'JavaScript') LOOP
            INSERT INTO project_tags (project_id, skill_id, is_required) 
            VALUES (project_record.id, skill_record.id, true)
            ON CONFLICT (project_id, skill_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Mobile App UI Redesign tags
    SELECT id INTO project_record FROM projects WHERE title = 'Mobile App UI Redesign' LIMIT 1;
    IF FOUND THEN
        FOR skill_record IN SELECT id FROM skills WHERE name IN ('React Native', 'UI/UX Design', 'Figma') LOOP
            INSERT INTO project_tags (project_id, skill_id, is_required) 
            VALUES (project_record.id, skill_record.id, true)
            ON CONFLICT (project_id, skill_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Smart Contract Development tags
    SELECT id INTO project_record FROM projects WHERE title = 'Smart Contract Development' LIMIT 1;
    IF FOUND THEN
        FOR skill_record IN SELECT id FROM skills WHERE name IN ('Solidity', 'Ethereum', 'Web3') LOOP
            INSERT INTO project_tags (project_id, skill_id, is_required) 
            VALUES (project_record.id, skill_record.id, true)
            ON CONFLICT (project_id, skill_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Vue.js Dashboard Components tags
    SELECT id INTO project_record FROM projects WHERE title = 'Vue.js Dashboard Components' LIMIT 1;
    IF FOUND THEN
        FOR skill_record IN SELECT id FROM skills WHERE name IN ('Vue.js', 'JavaScript', 'HTML/CSS') LOOP
            INSERT INTO project_tags (project_id, skill_id, is_required) 
            VALUES (project_record.id, skill_record.id, true)
            ON CONFLICT (project_id, skill_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;