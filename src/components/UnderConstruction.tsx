'use client';

import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(4, 230, 224, 0.15) 0%, rgba(4, 230, 224, 0.1) 100%);
  color: white;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const Message = styled.p`
  font-size: 1.1rem;
  max-width: 600px;
  line-height: 1.6;
  opacity: 0.8;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

export const UnderConstruction: React.FC = () => {
  return (
    <Container>
      <Icon>🚧</Icon>
      <Title>Under Construction</Title>
      <Subtitle>HyperFlip is temporarily unavailable</Subtitle>
      <Message>
        We're working hard to improve your experience. Please check back soon!
      </Message>
    </Container>
  );
}; 