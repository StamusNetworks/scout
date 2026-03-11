import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/common/testing/test-utils';
import { routeTree } from '@/routeTree.gen';

import { ActiveThreatBlockView } from './active-threat-block';
import { CoverageBlock } from './coverage-block';
import { ThreatBlockView } from './threat-block';

const createTestRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

describe('CoverageBlock', () => {
  test('renders name', () => {
    renderWithProviders(
      <CoverageBlock
        id={1}
        link="threat"
        familyClass="doc"
        name="Test Threat Name"
        isActive={false}
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Test Threat Name')).toBeInTheDocument();
  });

  test('renders description when provided', () => {
    renderWithProviders(
      <CoverageBlock
        id={1}
        link="threat"
        familyClass="doc"
        name="Test Threat"
        isActive={false}
        description="A detailed description of the threat"
      />,
      { router: createTestRouter() },
    );
    expect(
      screen.getByText('A detailed description of the threat'),
    ).toBeInTheDocument();
  });

  test('renders badge when provided', () => {
    renderWithProviders(
      <CoverageBlock
        id={1}
        link="threat"
        familyClass="doc"
        name="Test Threat"
        isActive={false}
        badge="Malware Family"
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Malware Family')).toBeInTheDocument();
  });

  test('does not render description when not provided', () => {
    renderWithProviders(
      <CoverageBlock
        id={1}
        link="threat"
        familyClass="doc"
        name="Test Threat"
        isActive={false}
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Test Threat')).toBeInTheDocument();
    // The card content area should not contain any paragraph with description
    expect(screen.queryByText('description')).not.toBeInTheDocument();
  });

  test('renders children', () => {
    renderWithProviders(
      <CoverageBlock
        id={1}
        link="threat"
        familyClass="doc"
        name="Test Threat"
        isActive={false}
      >
        <span>Child Content</span>
      </CoverageBlock>,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});

describe('ActiveThreatBlockView', () => {
  test('renders threat name, description, and family name', () => {
    renderWithProviders(
      <ActiveThreatBlockView
        id={42}
        familyClass="doc"
        name="Active Threat"
        description="This threat is currently active"
        familyName="Ransomware"
        victims={5}
        victimsNew={12}
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Active Threat')).toBeInTheDocument();
    expect(
      screen.getByText('This threat is currently active'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ransomware')).toBeInTheDocument();
  });

  test('renders "New victims" and "Total victims" stats', () => {
    renderWithProviders(
      <ActiveThreatBlockView
        id={42}
        familyClass="doc"
        name="Active Threat"
        description="Description"
        victims={5}
        victimsNew={12}
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('New victims')).toBeInTheDocument();
    expect(screen.getByText('Total victims')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

describe('ThreatBlockView', () => {
  test('renders threat name, description, and family name', () => {
    renderWithProviders(
      <ThreatBlockView
        id={99}
        familyClass="dopv"
        name="Policy Violation Threat"
        isActive={false}
        description="A policy violation description"
        familyName="Data Exfiltration"
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Policy Violation Threat')).toBeInTheDocument();
    expect(
      screen.getByText('A policy violation description'),
    ).toBeInTheDocument();
    expect(screen.getByText('Data Exfiltration')).toBeInTheDocument();
  });
});
