import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { assessmentDomains, domainNames, assessmentQuestions } from '../data/assessmentQuestions';
import './ProgressCharts.css';

const ProgressCharts = ({ assessments }) => {
  // Filter only completed assessments
  const completedAssessments = assessments.filter(a => a.status === 'complete');

  if (completedAssessments.length === 0) {
    return (
      <div className="no-data-message">
        <p>No completed assessments yet. Complete at least one assessment to see progress charts.</p>
      </div>
    );
  }

  // Prepare data for domain trends line chart
  const domainTrendsData = completedAssessments
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(assessment => ({
      date: new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      type: assessment.type,
      [domainNames[assessmentDomains.PLAY]]: parseFloat(assessment.domainAverages?.[assessmentDomains.PLAY] || 0),
      [domainNames[assessmentDomains.SELF_CARE]]: parseFloat(assessment.domainAverages?.[assessmentDomains.SELF_CARE] || 0),
      [domainNames[assessmentDomains.FINE_MOTOR]]: parseFloat(assessment.domainAverages?.[assessmentDomains.FINE_MOTOR] || 0),
      [domainNames[assessmentDomains.GROSS_MOTOR]]: parseFloat(assessment.domainAverages?.[assessmentDomains.GROSS_MOTOR] || 0)
    }));

  // Prepare pre/post comparison data
  const preAssessments = completedAssessments.filter(a => a.type === 'pre');
  const postAssessments = completedAssessments.filter(a => a.type === 'post');

  const prePostData = Object.values(assessmentDomains).map(domain => {
    const preAvg = preAssessments.length > 0
      ? preAssessments.reduce((sum, a) => sum + parseFloat(a.domainAverages?.[domain] || 0), 0) / preAssessments.length
      : 0;
    const postAvg = postAssessments.length > 0
      ? postAssessments.reduce((sum, a) => sum + parseFloat(a.domainAverages?.[domain] || 0), 0) / postAssessments.length
      : 0;

    return {
      domain: domainNames[domain],
      Pre: parseFloat(preAvg.toFixed(2)),
      Post: parseFloat(postAvg.toFixed(2)),
      Improvement: parseFloat((postAvg - preAvg).toFixed(2))
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="progress-charts">
      <div className="chart-section">
        <h3>Domain Averages Over Time</h3>
        <p className="chart-description">Track progress across all four assessment domains</p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={domainTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey={domainNames[assessmentDomains.PLAY]} stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey={domainNames[assessmentDomains.SELF_CARE]} stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey={domainNames[assessmentDomains.FINE_MOTOR]} stroke="#ffc658" strokeWidth={2} />
            <Line type="monotone" dataKey={domainNames[assessmentDomains.GROSS_MOTOR]} stroke="#ff7c7c" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {preAssessments.length > 0 && postAssessments.length > 0 && (
        <div className="chart-section">
          <h3>Pre vs Post Assessment Comparison</h3>
          <p className="chart-description">Average scores comparison across all domains</p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={prePostData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Pre" fill="#8884d8" />
              <Bar dataKey="Post" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <div className="improvements-summary">
            <h4>Improvements:</h4>
            <div className="improvement-items">
              {prePostData.map(item => (
                <div key={item.domain} className={`improvement-item ${item.Improvement > 0 ? 'positive' : item.Improvement < 0 ? 'negative' : 'neutral'}`}>
                  <span className="domain-label">{item.domain}:</span>
                  <span className="improvement-value">
                    {item.Improvement > 0 ? '+' : ''}{item.Improvement}
                    {item.Improvement > 0 && ' ↑'}
                    {item.Improvement < 0 && ' ↓'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="chart-section">
        <h3>Assessment Summary</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{completedAssessments.length}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{preAssessments.length}</div>
            <div className="stat-label">Pre-Assessments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{postAssessments.length}</div>
            <div className="stat-label">Post-Assessments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {completedAssessments.length > 0
                ? ((completedAssessments.reduce((sum, a) => {
                    const avg = Object.values(a.domainAverages || {}).reduce((s, v) => s + parseFloat(v || 0), 0) / 4;
                    return sum + avg;
                  }, 0) / completedAssessments.length).toFixed(2))
                : 0}
            </div>
            <div className="stat-label">Overall Average</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;
