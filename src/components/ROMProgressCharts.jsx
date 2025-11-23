import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { romBodyRegions, regionNames, getMeasurementsByRegion, calculateROMPercentage } from '../data/romQuestions';
import './ROMProgressCharts.css';

const ROMProgressCharts = ({ romAssessments }) => {
  if (!romAssessments || romAssessments.length === 0) {
    return (
      <div className="no-data-message">
        <p>No ROM assessment data available yet.</p>
        <p>Complete ROM assessments to see progress visualizations.</p>
      </div>
    );
  }

  const completedAssessments = romAssessments.filter(a => a.status === 'complete');

  if (completedAssessments.length === 0) {
    return (
      <div className="no-data-message">
        <p>No completed ROM assessments yet.</p>
        <p>Complete an assessment to see visualizations.</p>
      </div>
    );
  }

  // Get all measurements for progress tracking
  const getMeasurementKey = (measurementId, side) => {
    return side ? `${measurementId}_${side}` : measurementId;
  };

  // Calculate average ROM percentage for an assessment across all measured joints
  const calculateOverallROMPercentage = (assessment) => {
    if (!assessment.measurements || !assessment.selectedRegions) return 0;

    let totalPercentage = 0;
    let count = 0;

    assessment.selectedRegions.forEach(region => {
      const regionMeasurements = getMeasurementsByRegion(region);
      regionMeasurements.forEach(m => {
        if (m.bilateral) {
          const leftKey = getMeasurementKey(m.id, 'left');
          const rightKey = getMeasurementKey(m.id, 'right');

          if (assessment.measurements[leftKey]) {
            totalPercentage += calculateROMPercentage(assessment.measurements[leftKey], m.normalRange.max);
            count++;
          }
          if (assessment.measurements[rightKey]) {
            totalPercentage += calculateROMPercentage(assessment.measurements[rightKey], m.normalRange.max);
            count++;
          }
        } else {
          const key = getMeasurementKey(m.id);
          if (assessment.measurements[key]) {
            totalPercentage += calculateROMPercentage(assessment.measurements[key], m.normalRange.max);
            count++;
          }
        }
      });
    });

    return count > 0 ? Math.round(totalPercentage / count) : 0;
  };

  // Build timeline data for overall ROM percentage
  const timelineData = completedAssessments
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(assessment => ({
      date: new Date(assessment.createdAt).toLocaleDateString(),
      type: assessment.type === 'pre' ? 'Pre' : 'Post',
      percentage: calculateOverallROMPercentage(assessment),
      fullDate: assessment.createdAt
    }));

  // Build comparison data for pre vs post
  const preAssessments = completedAssessments.filter(a => a.type === 'pre');
  const postAssessments = completedAssessments.filter(a => a.type === 'post');

  const latestPre = preAssessments.length > 0
    ? preAssessments.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      )
    : null;

  const latestPost = postAssessments.length > 0
    ? postAssessments.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      )
    : null;

  // Build region-specific comparison data
  const buildRegionComparison = () => {
    if (!latestPre || !latestPost) return [];

    const commonRegions = latestPre.selectedRegions.filter(r =>
      latestPost.selectedRegions.includes(r)
    );

    return commonRegions.map(region => {
      let preTotal = 0, preCount = 0;
      let postTotal = 0, postCount = 0;

      const regionMeasurements = getMeasurementsByRegion(region);

      regionMeasurements.forEach(m => {
        if (m.bilateral) {
          ['left', 'right'].forEach(side => {
            const key = getMeasurementKey(m.id, side);
            if (latestPre.measurements[key]) {
              preTotal += calculateROMPercentage(latestPre.measurements[key], m.normalRange.max);
              preCount++;
            }
            if (latestPost.measurements[key]) {
              postTotal += calculateROMPercentage(latestPost.measurements[key], m.normalRange.max);
              postCount++;
            }
          });
        } else {
          const key = getMeasurementKey(m.id);
          if (latestPre.measurements[key]) {
            preTotal += calculateROMPercentage(latestPre.measurements[key], m.normalRange.max);
            preCount++;
          }
          if (latestPost.measurements[key]) {
            postTotal += calculateROMPercentage(latestPost.measurements[key], m.normalRange.max);
            postCount++;
          }
        }
      });

      return {
        region: regionNames[region],
        Pre: preCount > 0 ? Math.round(preTotal / preCount) : 0,
        Post: postCount > 0 ? Math.round(postTotal / postCount) : 0
      };
    });
  };

  const regionComparisonData = buildRegionComparison();

  // Build radar chart data for latest assessment
  const buildRadarData = (assessment) => {
    if (!assessment || !assessment.selectedRegions) return [];

    return assessment.selectedRegions.map(region => {
      let totalPercentage = 0;
      let count = 0;

      const regionMeasurements = getMeasurementsByRegion(region);

      regionMeasurements.forEach(m => {
        if (m.bilateral) {
          ['left', 'right'].forEach(side => {
            const key = getMeasurementKey(m.id, side);
            if (assessment.measurements[key]) {
              totalPercentage += calculateROMPercentage(assessment.measurements[key], m.normalRange.max);
              count++;
            }
          });
        } else {
          const key = getMeasurementKey(m.id);
          if (assessment.measurements[key]) {
            totalPercentage += calculateROMPercentage(assessment.measurements[key], m.normalRange.max);
            count++;
          }
        }
      });

      return {
        region: regionNames[region],
        percentage: count > 0 ? Math.round(totalPercentage / count) : 0
      };
    });
  };

  const latestAssessment = completedAssessments[completedAssessments.length - 1];
  const radarData = buildRadarData(latestAssessment);

  // Calculate improvement metrics
  const calculateImprovement = () => {
    if (!latestPre || !latestPost) return null;

    const prePercentage = calculateOverallROMPercentage(latestPre);
    const postPercentage = calculateOverallROMPercentage(latestPost);
    const improvement = postPercentage - prePercentage;

    return {
      prePercentage,
      postPercentage,
      improvement,
      improvementPercentage: prePercentage > 0 ? Math.round((improvement / prePercentage) * 100) : 0
    };
  };

  const improvement = calculateImprovement();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{payload[0].payload.date || payload[0].payload.region}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rom-progress-charts">
      {/* Summary Stats */}
      <div className="chart-section">
        <h3>ROM Assessment Summary</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{completedAssessments.length}</div>
            <div className="stat-label">Completed Assessments</div>
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
            <div className="stat-number">{calculateOverallROMPercentage(latestAssessment)}%</div>
            <div className="stat-label">Latest Overall ROM</div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="chart-section">
        <h3>ROM Progress Over Time</h3>
        <p className="chart-description">
          Track overall ROM percentage across all assessments
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} label={{ value: 'ROM %', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#667eea"
              strokeWidth={2}
              name="Overall ROM %"
              dot={{ fill: '#667eea', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart for Latest Assessment */}
      {radarData.length > 0 && (
        <div className="chart-section">
          <h3>Latest Assessment - ROM by Region</h3>
          <p className="chart-description">
            ROM percentage distribution across different body regions
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="region" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="ROM %"
                dataKey="percentage"
                stroke="#667eea"
                fill="#667eea"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pre vs Post Comparison */}
      {regionComparisonData.length > 0 && (
        <div className="chart-section">
          <h3>Pre vs Post Assessment Comparison</h3>
          <p className="chart-description">
            Compare ROM percentages by region between latest pre and post assessments
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis domain={[0, 100]} label={{ value: 'ROM %', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Pre" fill="#8884d8" />
              <Bar dataKey="Post" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          {/* Improvement Summary */}
          {improvement && (
            <div className="improvements-summary">
              <h4>Improvement Analysis</h4>
              <div className="improvement-items">
                <div className={`improvement-item ${improvement.improvement >= 0 ? 'positive' : 'negative'}`}>
                  <span className="domain-label">Overall Improvement</span>
                  <span className="improvement-value">
                    {improvement.improvement >= 0 ? '+' : ''}{improvement.improvement}%
                  </span>
                </div>
                <div className={`improvement-item ${improvement.improvement >= 0 ? 'positive' : 'negative'}`}>
                  <span className="domain-label">Relative Change</span>
                  <span className="improvement-value">
                    {improvement.improvementPercentage >= 0 ? '+' : ''}{improvement.improvementPercentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ROMProgressCharts;
