// ═══════════════════════════════════════════
//  SYNCARE — pages/AboutUsPage.jsx
// ═══════════════════════════════════════════

import React from 'react';
import './AboutUsPage.css';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Ahmed Atta',
    role: 'Leader',
    contribution: 'lead the development of Syncare, overseeing the frontend experience and ensuring a seamless and intuitive user interface. In parallel, I independently developed the face recognition model, handling its design and implementation as a separate system to enhance identity verification and overall system efficiency.',
    photoUrl: `${process.env.PUBLIC_URL}/images/image1.jpg`,
  },
  {
    id: 2,
    name: 'Ahmed (KTD) Khaled',
    role: 'Backend Architect & Developer',
    contribution: "I build the foundation that allows Syncare to move fast without breaking things. As the lead architect of our backend infrastructure, I am responsible for designing a server environment where performance and privacy coexist perfectly. I engineer high-speed, zero-latency data pipelines that deliver information in milliseconds, backed by state-of-the-art cryptographic hashing to keep every byte of patient data heavily encrypted. My goal is to create a seamless, flawless experience where doctors and patients never have to think about the complex technology working behind the scenes.",
    photoUrl: `${process.env.PUBLIC_URL}/images/image2.jpg`,
  },
  {
    id: 3,
    name: 'Esraa Esmat',
    role: 'Member',
    contribution: '',
    photoUrl: `${process.env.PUBLIC_URL}/images/image3.jpg`, // missing, needs fallback or addition later
  },
  {
    id: 4,
    name: 'Ahmed Adel',
    role: 'Member',
    contribution: '',
    photoUrl: `${process.env.PUBLIC_URL}/images/image4.jpg`,
  },
  {
    id: 5,
    name: 'Khaled Ladham',
    role: 'Member',
    contribution: '',
    photoUrl: `${process.env.PUBLIC_URL}/images/image5.jpg`,
  },
  {
    id: 6,
    name: 'Ahmed Hani',
    role: 'Member',
    contribution: '',
    photoUrl: `${process.env.PUBLIC_URL}/images/image6.jpg`, // missing
  },
  {
    id: 7,
    name: 'Sama Mohammed',
    role: 'Member',
    contribution: '',
    photoUrl: `${process.env.PUBLIC_URL}/images/image7.jpg`, // missing
  },
  {
    id: 8,
    name: 'Shrouk Mohamed',
    role: 'Member',
    contribution: '',
    photoUrl: `${process.env.PUBLIC_URL}/images/image8.jpg`, // missing
  },
  {
    id: 9,
    name: 'Sajid Almanakhly',
    role: 'Modelling and Development',
    contribution: "Was responsible for the continous modelling of the system, adjusting the parameters, and the creation of the objective functions used for optimization of patient appointments. I've also participated in the 3D map navigation, and in creation of the mobile port of SynCare.",
    photoUrl: `${process.env.PUBLIC_URL}/images/image9.jpg`,
  }
];

const AboutUsPage = () => {
  return (
    <div className="about-page">
      <div className="about-page__header">
        <span className="about-page__tag">🚀 Our Team</span>
        <h1>About Us</h1>
        <p>Meet the brilliant minds behind SynCare. We are dedicated to making healthcare accessible and seamless.</p>
      </div>

      <div className="about-page__grid">
        {TEAM_MEMBERS.map((member) => (
          <div key={member.id} className="about-member-card">
            <div className="about-member-card__photo">
              <img src={member.photoUrl} alt={member.name} />
            </div>
            <div className="about-member-card__info">
              <h3>{member.name}</h3>
              <span className="about-member-card__role">{member.role}</span>
              <p className="about-member-card__contrib">{member.contribution}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUsPage;
