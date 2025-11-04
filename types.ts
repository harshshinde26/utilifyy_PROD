import React from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface ToolProps {
  selectedCurrency?: Currency;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon: React.ReactNode;
  component: React.FC<ToolProps>;
}
