import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Trophy, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FootballDashboard = ({ theme }) => {
  const [competitions, setCompetitions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get(`${API}/football/competitions`);
      if (response.data && response.data.competitions) {
        setCompetitions(response.data.competitions);
        // Auto-select first competition
        if (response.data.competitions.length > 0 && !selectedCompetition) {
          setSelectedCompetition(response.data.competitions[0].code);
        }
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast.error('Failed to load competitions');
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/football/matches`);
      if (response.data && response.data.matches) {
        setMatches(response.data.matches);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitionMatches = async (code) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/football/competition/${code}/matches`);
      if (response.data && response.data.matches) {
        setMatches(response.data.matches);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching competition matches:', error);
      toast.error('Failed to load competition matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchStandings = async (code) => {
    try {
      const response = await axios.get(`${API}/football/competition/${code}/standings`);
      if (response.data) {
        setStandings(response.data);
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
      toast.error('Failed to load standings');
    }
  };

  useEffect(() => {
    fetchCompetitions();
    fetchMatches();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      fetchCompetitionMatches(selectedCompetition);
      fetchStandings(selectedCompetition);
    }
  }, [selectedCompetition]);

  const getMatchStatus = (match) => {
    const status = match.status;
    if (status === 'IN_PLAY' || status === 'PAUSED') {
      return { text: 'LIVE', color: '#ef4444', isLive: true };
    } else if (status === 'FINISHED') {
      return { text: 'FT', color: '#6b7280', isLive: false };
    } else if (status === 'SCHEDULED' || status === 'TIMED') {
      return { text: 'UPCOMING', color: '#3b82f6', isLive: false };
    } else {
      return { text: status, color: '#6b7280', isLive: false };
    }
  };

  const MatchCard = ({ match }) => {
    const status = getMatchStatus(match);
    
    return (
      <Card 
        className="p-6 card-hover animate-slide-in"
        data-testid={`football-match-card-${match.id}`}
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          borderWidth: '1px'
        }}
      >
        {/* Match Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              {match.competition?.name || 'Competition'}
            </h3>
            {match.venue && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <MapPin className="w-3 h-3" />
                {match.venue}
              </p>
            )}
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
          {/* Home Team */}
          <div className="flex justify-between items-center p-3 rounded-lg" 
            style={{ background: 'var(--sport-light)' }}
          >
            <div className="flex items-center gap-3 flex-1">
              {match.homeTeam?.crest && (
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {match.homeTeam?.name || match.homeTeam?.shortName || 'Home'}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {match.score?.fullTime?.home ?? '-'}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex justify-between items-center p-3 rounded-lg" 
            style={{ background: 'var(--sport-light)' }}
          >
            <div className="flex items-center gap-3 flex-1">
              {match.awayTeam?.crest && (
                <img 
                  src={match.awayTeam.crest} 
                  alt={match.awayTeam.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {match.awayTeam?.name || match.awayTeam?.shortName || 'Away'}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {match.score?.fullTime?.away ?? '-'}
            </div>
          </div>
        </div>

        {/* Half Time Score */}
        {match.score?.halfTime && (match.score.halfTime.home !== null || match.score.halfTime.away !== null) && (
          <div className="mt-3 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Half Time: {match.score.halfTime.home} - {match.score.halfTime.away}
          </div>
        )}

        {/* Date/Time */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between" 
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Calendar className="w-3 h-3" />
            {match.utcDate ? new Date(match.utcDate).toLocaleDateString() : 'Date TBA'}
          </div>
          {status.text === 'UPCOMING' && match.utcDate && (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const StandingsTable = ({ standings }) => {
    if (!standings || !standings.standings || standings.standings.length === 0) {
      return (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
          No standings available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {standings.standings.map((standing, idx) => (
          <Card 
            key={idx}
            className="p-6 animate-slide-in"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {standing.group || standings.competition?.name || 'Standings'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>Pos</th>
                    <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>Team</th>
                    <th className="text-center py-2 px-2" style={{ color: 'var(--text-secondary)' }}>P</th>
                    <th className="text-center py-2 px-2" style={{ color: 'var(--text-secondary)' }}>W</th>
                    <th className="text-center py-2 px-2" style={{ color: 'var(--text-secondary)' }}>D</th>
                    <th className="text-center py-2 px-2" style={{ color: 'var(--text-secondary)' }}>L</th>
                    <th className="text-center py-2 px-2" style={{ color: 'var(--text-secondary)' }}>GD</th>
                    <th className="text-center py-2 px-2 font-bold" style={{ color: 'var(--text-secondary)' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standing.table.map((team, index) => (
                    <tr 
                      key={team.team.id}
                      className="border-b hover:bg-opacity-50 transition-colors"
                      style={{ 
                        borderColor: 'var(--border-color)',
                        background: index === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                      }}
                      data-testid={`standing-row-${team.team.id}`}
                    >
                      <td className="py-3 px-2">
                        <span 
                          className="font-bold"
                          style={{ color: index < 4 ? 'var(--sport-primary)' : 'var(--text-primary)' }}
                        >
                          {team.position}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {team.team.crest && (
                            <img 
                              src={team.team.crest} 
                              alt={team.team.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {team.team.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                        {team.playedGames}
                      </td>
                      <td className="text-center py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                        {team.won}
                      </td>
                      <td className="text-center py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                        {team.draw}
                      </td>
                      <td className="text-center py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                        {team.lost}
                      </td>
                      <td className="text-center py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="font-bold" style={{ color: 'var(--sport-primary)' }}>
                          {team.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Football
          </h2>
          {lastUpdated && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger 
              className="w-full md:w-[250px]"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              data-testid="competition-select"
            >
              <SelectValue placeholder="Select competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.code}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => selectedCompetition ? fetchCompetitionMatches(selectedCompetition) : fetchMatches()}
            disabled={loading}
            data-testid="refresh-football-button"
            style={{
              background: 'var(--sport-primary)',
              color: '#ffffff'
            }}
            className="rounded-full"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
            data-testid="football-matches-tab"
            style={{
              color: activeTab === 'matches' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'matches' ? 'var(--sport-primary)' : 'transparent'
            }}
            className="rounded-md"
          >
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger 
            value="standings" 
            data-testid="football-standings-tab"
            style={{
              color: activeTab === 'standings' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'standings' ? 'var(--sport-primary)' : 'transparent'
            }}
            className="rounded-md"
          >
            Standings
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
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="standings" className="mt-6">
          {standings ? (
            <StandingsTable standings={standings} />
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>Select a competition to view standings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FootballDashboard;