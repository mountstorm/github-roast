'use client';

import { useState } from 'react';

export default function GitRoast() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState(null);
  const [error, setError] = useState('');

  const extractUsername = (input) => {
    const cleaned = input.trim();

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/i,
      /^([a-zA-Z0-9-]+)$/,
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return cleaned;
  };

  const generateSeinfeldRoast = (userData, repos) => {
    const roasts = [];
    
    // Opening Seinfeld-style observation
    roasts.push(`So I'm looking at ${userData.name || userData.login}'s GitHub profile...`);
    
    // Bio roast
    if (!userData.bio) {
      roasts.push(`No bio? What's the deal with that? You've got ${userData.public_repos} repositories but can't write ONE sentence about yourself? That's like showing up to a party and refusing to say your name.`);
    } else if (userData.bio.length < 20) {
      roasts.push(`"${userData.bio}" - That's your bio? I've seen longer text messages from my mother. And she just discovered emojis.`);
    } else if (userData.bio.toLowerCase().includes('passionate') || userData.bio.toLowerCase().includes('enthusiast')) {
      roasts.push(`"Passionate developer" - Yeah, we're ALL passionate. That's like a chef saying "I'm passionate about food." We know! That's why you're here!`);
    }

    // Followers roast
    if (userData.followers === 0) {
      roasts.push(`Zero followers! ZERO! You know what that is? That's not even your mom following you. She couldn't find the button!`);
    } else if (userData.followers < 10) {
      roasts.push(`${userData.followers} followers? I've seen more people show up to a dentist appointment. And nobody WANTS to be there!`);
    } else if (userData.following > userData.followers * 2) {
      roasts.push(`You're following ${userData.following} people but only ${userData.followers} follow you back? That's not networking, that's stalking! That's the GitHub equivalent of following your ex on Instagram!`);
    }

    // Repository count roast
    if (userData.public_repos === 0) {
      roasts.push(`No public repositories? So what do you DO here? This is like joining a gym and never working out. Actually, it's EXACTLY like that!`);
    } else if (userData.public_repos > 50) {
      roasts.push(`${userData.public_repos} repositories?! What are you, a digital hoarder? You know what that is? That's ${userData.public_repos} unfinished projects wearing a trench coat pretending to be a portfolio!`);
    }

    // Repo analysis
    if (repos.length > 0) {
      const forkedRepos = repos.filter(r => r.fork).length;
      const ownRepos = repos.filter(r => !r.fork);
      
      if (forkedRepos > ownRepos.length) {
        roasts.push(`I see ${forkedRepos} forks. You know what that means? You're clicking "Fork" like it's a Netflix "Add to List" button. Congratulations, you're collecting repos like Pokemon cards!`);
      }

      // Check for stars
      const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      if (totalStars === 0) {
        roasts.push(`Zero stars across all your repos? Not even a pity star? That's rough. My grandmother could accidentally star something just by opening GitHub!`);
      } else if (totalStars < 5) {
        roasts.push(`${totalStars} total stars. And I'm guessing ${Math.min(totalStars, 2)} of those are your alt accounts. Don't lie to me!`);
      }

      // Commit message roast
      const repoNames = ownRepos.slice(0, 5).map(r => r.name);
      const hasBoringNames = repoNames.some(name => 
        name.includes('test') || 
        name.includes('demo') || 
        name.includes('practice') ||
        name.includes('temp') ||
        name === name.toLowerCase().replace(/-/g, '')
      );
      
      if (hasBoringNames) {
        roasts.push(`"test-repo", "my-project", "practice"... These names! This is like naming your kids "Child 1", "Child 2". Put some EFFORT in!`);
      }

      // Check last update
      const recentRepos = ownRepos.filter(r => {
        const updated = new Date(r.updated_at);
        const monthsAgo = (Date.now() - updated) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo < 1;
      });

      if (recentRepos.length === 0 && ownRepos.length > 0) {
        roasts.push(`Your last commit was WHEN? This profile is like a museum. A museum of abandoned dreams! Even the tumbleweeds are asking "Is anyone coming back?"`);
      }

      // README roast
      const noReadme = ownRepos.filter(r => !r.description && r.stargazers_count === 0).length;
      if (noReadme > 3) {
        roasts.push(`${noReadme} repos with no description? What IS this? I open your repo and it's like walking into an unlabeled mystery box. Is it Python? Is it JavaScript? Is it a cry for help? WHO KNOWS!`);
      }

      // Language diversity
      const languages = [...new Set(ownRepos.map(r => r.language).filter(Boolean))];
      if (languages.length === 1) {
        roasts.push(`Only ${languages[0]}? You know what that is? That's like only eating pizza. Sure, pizza's great, but you gotta try a salad once in a while! Branch out!`);
      } else if (languages.length > 10) {
        roasts.push(`${languages.length} different languages?! Pick a lane! You're trying to be a polyglot and ending up as a jack of all trades, master of "Hello World"!`);
      }
    }

    // Account age roast
    const accountAge = Math.floor((Date.now() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24 * 365));
    if (accountAge > 5 && userData.public_repos < 10) {
      roasts.push(`You've been on GitHub for ${accountAge} YEARS and have ${userData.public_repos} repos? That's like joining a book club in 2019 and still being on page one!`);
    }

    // Profile picture roast
    if (userData.avatar_url.includes('identicon') || !userData.avatar_url) {
      roasts.push(`No profile picture? You're out here with the default avatar like it's 2005 MySpace. At least TRY to pretend you care!`);
    }

    // Closing Seinfeld observation
    roasts.push(`But hey, what do I know? Maybe in your world, this is peak performance. Maybe in an alternate universe, this profile is CRUSHING it. But in THIS universe? In THIS timeline? ...Yeah, you might wanna push some code.`);

    return roasts;
  };

  const handleRoast = async (e) => {
    e.preventDefault();
    setError('');
    setRoast(null);
    setLoading(true);

    try {
      const cleanUsername = extractUsername(username);
      
      if (!cleanUsername) {
        throw new Error('Please enter a valid GitHub username or URL');
      }

      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${cleanUsername}`);
      if (!userResponse.ok) {
        throw new Error('User not found. Check the username and try again!');
      }
      const userData = await userResponse.json();

      // Fetch repositories
      const reposResponse = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`);
      const repos = await reposResponse.json();

      // Generate Seinfeld-style roast
      const roastLines = generateSeinfeldRoast(userData, repos);

      setRoast({
        user: userData,
        lines: roastLines,
        repos: repos.filter(r => !r.fork).slice(0, 5)
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            GitRoast
          </h1>
          <p className="text-xl text-gray-600 italic">
            "What's the deal with your GitHub profile?"
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Get roasted by Seinfeld-style comedy
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleRoast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter GitHub Username or URL
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat  or  github.com/octocat"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Works with: username, github.com/username, or full URL
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all text-lg shadow-lg"
            >
              {loading ? '🔥 Roasting in progress...' : '🎤 Roast My GitHub!'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Roast Results */}
        {roast && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-200">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={roast.user.avatar_url} 
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-orange-300"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {roast.user.name || roast.user.login}
                  </h2>
                  <a 
                    href={roast.user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline"
                  >
                    @{roast.user.login}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{roast.user.public_repos}</div>
                  <div className="text-xs text-gray-600">Repos</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{roast.user.followers}</div>
                  <div className="text-xs text-gray-600">Followers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{roast.user.following}</div>
                  <div className="text-xs text-gray-600">Following</div>
                </div>
              </div>
            </div>

            {/* The Roast */}
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-xl p-8 border-2 border-orange-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🎤</div>
                <h3 className="text-2xl font-bold text-gray-900">The Roast</h3>
              </div>

              <div className="space-y-4">
                {roast.lines.map((line, idx) => (
                  <div 
                    key={idx}
                    className="bg-white/80 backdrop-blur rounded-lg p-4 border-l-4 border-orange-500"
                  >
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {line}
                    </p>
                  </div>
                ))}
              </div>

              {/* Share Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    const text = `I just got roasted by GitRoast! 🔥\n\nCheck out my GitHub: ${roast.user.html_url}\n\nGet roasted yourself at: ${window.location.href}`;
                    navigator.clipboard.writeText(text);
                    alert('Roast copied! Share it on Twitter! 🔥');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  📋 Copy Roast to Share
                </button>
              </div>
            </div>

            {/* Top Repos */}
            {roast.repos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📁 Recent Repos (The Evidence)
                </h3>
                <div className="space-y-3">
                  {roast.repos.map((repo, idx) => (
                    <a
                      key={idx}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {repo.description || 'No description provided'}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500 ml-4">
                          <div>⭐ {repo.stargazers_count}</div>
                          {repo.language && (
                            <div className="mt-1 text-xs">{repo.language}</div>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Roast Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setRoast(null);
                  setUsername('');
                }}
                className="text-orange-600 hover:text-orange-700 font-medium underline"
              >
                🔥 Roast Another Profile
              </button>
            </div>
          </div>
        )}

        {/* Examples */}
        {!roast && !loading && (
          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border-2 border-dashed border-orange-300">
            <h3 className="font-bold text-gray-700 mb-3">Try these examples:</h3>
            <div className="flex flex-wrap gap-2">
              {['torvalds', 'gaearon', 'tj', 'sindresorhus', 'defunkt'].map(example => (
                <button
                  key={example}
                  onClick={() => setUsername(example)}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>From Muzaffar’s terminal to your ego • Open source roasting since 2025.</p>
        </div>
      </div>
    </div>
  );
}