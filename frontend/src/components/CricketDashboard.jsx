import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CricketDashboard = ({ theme }) => {
  const [matches, setMatches] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cricket/current-matches`);
      if (response.data && response.data.data) {
        setMatches(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching cricket matches:', error);
      toast.error('Failed to load cricket matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await axios.get(`${API}/cricket/series`);
      if (response.data && response.data.data) {
        setSeries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cricket series:', error);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchSeries();
    
    // Auto-refresh every 30 seconds for live matches
    const interval = setInterval(() => {
      fetchMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getMatchStatus = (match) => {
    if (match.matchStarted && !match.matchEnded) {
      return { text: 'LIVE', color: '#ef4444', isLive: true };
    } else if (match.matchEnded) {
      return { text: 'FINISHED', color: '#6b7280', isLive: false };
    } else {
      return { text: 'UPCOMING', color: '#3b82f6', isLive: false };
    }
  };

  const MatchCard = ({ match }) => {
    const status = getMatchStatus(match);
    
    return (
      <Card 
        className="p-6 card-hover animate-slide-in"
        data-testid={`cricket-match-card-${match.id}`}
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          borderWidth: '1px'
        }}
      >
        {/* Match Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              {match.matchType} • {match.series || 'Series'}
            </h3>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <MapPin className="w-3 h-3" />
              {match.venue || 'Venue TBA'}
            </p>
          </div>
          <Badge 
            style={{
              background: status.isLive ? status.color : 'transparent',
              color: status.isLive ? '#ffffff' : status.color,
              borderColor: status.color,
              borderWidth: status.isLive ? '0' : '1px'
            }}
            className="flex items-center gap-1"
            data-testid={`match-status-${match.id}`}
          >
            {status.isLive && <span className="live-dot"></span>}
            {status.text}
          </Badge>
        </div>

        {/* Teams */}
        <div className="space-y-3">
          {/* Team 1 */}
          <div className="flex justify-between items-center p-3 rounded-lg" 
            style={{ background: 'var(--sport-light)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ background: 'var(--sport-primary)', color: '#ffffff' }}
              >
                {match.teamInfo?.[0]?.shortname?.substring(0, 3) || match.teams?.[0]?.substring(0, 3) || 'T1'}
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {match.teamInfo?.[0]?.name || match.teams?.[0] || 'Team 1'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {match.score?.[0]?.r || '-'}
                {match.score?.[0]?.w !== undefined && `/${match.score[0].w}`}
              </div>
              {match.score?.[0]?.o && (
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {match.score[0].o} overs
                </div>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex justify-between items-center p-3 rounded-lg" 
            style={{ background: 'var(--sport-light)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ background: 'var(--sport-primary)', color: '#ffffff' }}
              >
                {match.teamInfo?.[1]?.shortname?.substring(0, 3) || match.teams?.[1]?.substring(0, 3) || 'T2'}
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {match.teamInfo?.[1]?.name || match.teams?.[1] || 'Team 2'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {match.score?.[1]?.r || '-'}
                {match.score?.[1]?.w !== undefined && `/${match.score[1].w}`}
              </div>
              {match.score?.[1]?.o && (
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {match.score[1].o} overs
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Status/Result */}
        {match.status && (
          <div className="mt-4 p-3 rounded-lg text-center font-medium" 
            style={{ 
              background: status.isLive ? 'rgba(239, 68, 68, 0.1)' : 'var(--sport-light)',
              color: 'var(--text-primary)'
            }}
          >
            {match.status}
          </div>
        )}

        {/* Date/Time */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between" 
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Calendar className="w-3 h-3" />
            {match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleDateString() : 'Date TBA'}
          </div>
          {!match.matchEnded && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3 h-3" />
              {match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBA'}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const SeriesCard = ({ seriesItem }) => (
    <Card 
      className="p-5 card-hover animate-slide-in"
      data-testid={`cricket-series-card-${seriesItem.id}`}
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: '1px'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            {seriesItem.name}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" style={{ background: 'var(--sport-light)', color: 'var(--sport-primary)' }}>
              {seriesItem.matchFormat || 'All Formats'}
            </Badge>
            {seriesItem.season && (
              <Badge variant="outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                {seriesItem.season}
              </Badge>
            )}
          </div>
          {seriesItem.startDate && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Calendar className="w-4 h-4" />
              {new Date(seriesItem.startDate).toLocaleDateString()} - {seriesItem.endDate ? new Date(seriesItem.endDate).toLocaleDateString() : 'Ongoing'}
            </div>
          )}
        </div>
        <Badge 
          style={{
            background: seriesItem.matchFormat === 'T20' ? '#ef4444' : seriesItem.matchFormat === 'ODI' ? '#3b82f6' : '#10b981',
            color: '#ffffff'
          }}
        >
          {seriesItem.matchFormat || 'Series'}
        </Badge>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Cricket
          </h2>
          {lastUpdated && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          onClick={fetchMatches}
          disabled={loading}
          data-testid="refresh-cricket-button"
          style={{
            background: 'var(--sport-primary)',
            color: '#ffffff'
          }}
          className="rounded-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList 
          className="inline-flex p-1 rounded-lg"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <TabsTrigger 
            value="matches" 
            data-testid="cricket-matches-tab"
            style={{
              color: activeTab === 'matches' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'matches' ? 'var(--sport-primary)' : 'transparent'
            }}
            className="rounded-md"
          >
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger 
            value="series" 
            data-testid="cricket-series-tab"
            style={{
              color: activeTab === 'series' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'series' ? 'var(--sport-primary)' : 'transparent'
            }}
            className="rounded-md"
          >
            Series ({series.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-6">
          {loading && matches.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: 'var(--sport-primary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>No matches available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match, index) => (
                <MatchCard key={match.id || index} match={match} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="series" className="mt-6">
          {series.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>No series available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((seriesItem, index) => (
                <SeriesCard key={seriesItem.id || index} seriesItem={seriesItem} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CricketDashboard;