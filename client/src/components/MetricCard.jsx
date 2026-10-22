import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'metric-accent-blue',
    green: 'metric-accent-green',
    purple: 'metric-accent-purple',
    amber: 'metric-accent-amber',
    rose: 'metric-accent-rose',
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="metric-card">
      <div>
        <p className="metric-title">{title}</p>
        <h3 className={`metric-value ${style}`}>{value}</h3>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
      {Icon && <Icon className="metric-icon" aria-hidden="true" />}
    </div>
  );
}
