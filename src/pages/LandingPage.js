import React from 'react';
import Button from '../components/Button';

const LandingPage = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Early Detection',
      description: 'Advanced screening tools to identify dyslexia patterns early and accurately.'
    },
    {
      icon: '📖',
      title: 'Learning Resources',
      description: 'Tailored educational materials and strategies for effective learning.'
    },
    {
      icon: '👥',
      title: 'Community Support',
      description: 'Connect with others, share experiences, and find encouragement.'
    },
    {
      icon: '🔧',
      title: 'Assistive Tools',
      description: 'Digital tools and technologies to support reading and writing.'
    }
  ];

  return (
    <div className="landing-page">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-content">
          <div className="hero-text">
            <h1 id="hero-heading">Understanding Dyslexia, Empowering Lives</h1>
            <p className="hero-description">
              A comprehensive platform providing resources, tools, and support 
              for individuals with dyslexia and their families.
            </p>
            <div className="hero-buttons" role="group" aria-label="Get started actions">
              <Button 
                to="/register" 
                variant="primary" 
                size="large"
                ariaLabel="Create account to get started"
              >
                Get Started
              </Button>
              <Button 
                href="#features" 
                variant="secondary" 
                size="large"
                ariaLabel="Learn more about our features"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="hero-image" role="img" aria-label="Educational resources illustration">
            <div className="placeholder-image">
              <span role="img" aria-label="Books and learning">📚</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading">How We Help</h2>
          <div className="features-grid" role="list">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" role="listitem">
                <div 
                  className="feature-icon" 
                  role="img" 
                  aria-label={feature.title}
                >
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Ready to Begin Your Journey?</h2>
          <p>Join thousands of individuals who have found support and success.</p>
          <div className="cta-buttons" role="group" aria-label="Account actions">
            <Button 
              to="/register" 
              variant="primary" 
              size="large"
              ariaLabel="Create your account now"
            >
              Create Account
            </Button>
            <Button 
              to="/login" 
              variant="outline" 
              size="large"
              ariaLabel="Sign in to existing account"
            >
              Already Have Account?
            </Button>
          </div>
        </div>
      </section>

      <section className="admin-access" aria-labelledby="admin-heading">
        <div className="container">
          <div className="admin-panel">
            <div className="admin-info">
              <h3 id="admin-heading">🔐 Administrator Access</h3>
              <p>View and manage user database entries</p>
            </div>
            <div className="admin-action">
              <Button 
                to="/database" 
                variant="admin" 
                ariaLabel="Access admin database viewer"
              >
                🔐 Admin Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;