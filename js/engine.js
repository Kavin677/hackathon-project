/**
 * Match / Gap — Skill Extraction, Weighted Scoring, and Heuristic Engine
 * Reusable, pure functional client-side logic.
 */

const MatchGapEngine = (() => {

  /**
   * Escape special regex characters
   */
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Safe HTML escape to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Build boundary regex for skills and aliases.
   * Handles symbols like C++, C#, .NET, Node.js, CI/CD, R, C accurately.
   */
  function createSkillPattern(term) {
    const raw = term.trim();
    // Special handling for single-letter programming languages
    if (raw.toLowerCase() === 'c') {
      // Must be uppercase C, bounded by non-alphanumeric, not in parentheses like (c) copyright
      return /(?:^|[\s,;/+])C(?=[\s,;/+]|$)/g;
    }
    if (raw.toLowerCase() === 'r') {
      // Uppercase R or 'r programming'/'r language'
      return /(?:^|[\s,;/])R(?=[\s,;/]|$)/g;
    }

    const escaped = escapeRegex(raw);

    // Prefix boundary
    let prefix;
    if (/^[a-zA-Z0-9]/.test(raw)) {
      prefix = '(?<=^|[^a-zA-Z0-9_#+])';
    } else {
      prefix = '(?<=^|[\\s,;:(/])';
    }

    // Suffix boundary
    let suffix;
    if (/[a-zA-Z0-9]$/.test(raw)) {
      suffix = '(?=$|[^a-zA-Z0-9_#+])';
    } else {
      suffix = '(?=$|[\\s,;:)/!?.])';
    }

    return new RegExp(prefix + escaped + suffix, 'gi');
  }

  /**
   * Extracts skills from raw text against the taxonomy.
   * Returns:
   * {
   *   skillsByCategory: { "Languages": ["python", "sql"], ... },
   *   allSkills: Set(["python", "sql"]),
   *   skillDetails: Map(skillName => { canonical, category, matchedAlias, matchIndex })
   * }
   */
  function extractSkills(rawText, taxonomy = SKILLS_TAXONOMY) {
    const result = {
      skillsByCategory: {},
      allSkills: new Set(),
      skillDetails: new Map(),
      matchedPhrases: [] // for highlight rendering: { text, canonical, category, start, end }
    };

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return result;
    }

    for (const [category, skillsObj] of Object.entries(taxonomy)) {
      result.skillsByCategory[category] = [];

      for (const [canonical, aliases] of Object.entries(skillsObj)) {
        // Build search terms: canonical skill + all aliases, ordered longest first
        const termsToSearch = [canonical, ...aliases].sort((a, b) => b.length - a.length);
        let foundForThisSkill = false;

        for (const term of termsToSearch) {
          try {
            const regex = createSkillPattern(term);
            let match;
            while ((match = regex.exec(rawText)) !== null) {
              const matchedStr = match[0];
              const matchIdx = match.index;

              if (!foundForThisSkill) {
                result.allSkills.add(canonical);
                if (!result.skillsByCategory[category].includes(canonical)) {
                  result.skillsByCategory[category].push(canonical);
                }
                result.skillDetails.set(canonical, {
                  canonical,
                  category,
                  matchedAlias: matchedStr.trim(),
                  index: matchIdx
                });
                foundForThisSkill = true;
              }

              result.matchedPhrases.push({
                matchedText: matchedStr.trim(),
                canonical,
                category,
                startIndex: matchIdx,
                endIndex: matchIdx + matchedStr.length
              });
            }
          } catch (e) {
            // Fallback simple word boundary check if lookaround fails in rare legacy browser
            const fallbackRegex = new RegExp('\\b' + escapeRegex(term) + '\\b', 'gi');
            if (fallbackRegex.test(rawText)) {
              result.allSkills.add(canonical);
              if (!result.skillsByCategory[category].includes(canonical)) {
                result.skillsByCategory[category].push(canonical);
              }
              result.skillDetails.set(canonical, {
                canonical,
                category,
                matchedAlias: term,
                index: 0
              });
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Auto-splits Job Description into Required vs Preferred segments.
   * Markers: preferred, nice to have, good to have, bonus, desirable, plus if you have
   */
  function splitJobDescription(jdText) {
    if (!jdText) {
      return { requiredText: '', preferredText: '', markerFound: null, splitIndex: -1 };
    }

    const markers = [
      /\b(?:preferred|nice\s+to\s+have|good\s+to\s+have|bonus(?:\s+points)?|desirable|plus\s+if\s+you\s+have|preferred\s+qualifications|bonus\s+skills)\b/i
    ];

    let earliestIndex = -1;
    let foundMarker = null;

    for (const markerRegex of markers) {
      const match = markerRegex.exec(jdText);
      if (match) {
        if (earliestIndex === -1 || match.index < earliestIndex) {
          earliestIndex = match.index;
          foundMarker = match[0];
        }
      }
    }

    if (earliestIndex !== -1) {
      return {
        requiredText: jdText.substring(0, earliestIndex).trim(),
        preferredText: jdText.substring(earliestIndex).trim(),
        markerFound: foundMarker,
        splitIndex: earliestIndex
      };
    }

    return {
      requiredText: jdText.trim(),
      preferredText: '',
      markerFound: null,
      splitIndex: -1
    };
  }

  /**
   * Main Scoring Engine:
   * Splits JD, extracts required/preferred, scores against resume skills.
   * Required weight: 1.5x, Preferred weight: 1.0x
   */
  function analyzeMatch(resumeText, jdText, taxonomy = SKILLS_TAXONOMY) {
    const jdSplit = splitJobDescription(jdText);

    // Extract skills
    const resumeExtraction = extractSkills(resumeText, taxonomy);
    const requiredExtraction = extractSkills(jdSplit.requiredText, taxonomy);
    const preferredExtraction = extractSkills(jdSplit.preferredText, taxonomy);

    const resumeSkills = resumeExtraction.allSkills;
    const requiredSkillsSet = new Set(requiredExtraction.allSkills);
    const preferredSkillsSet = new Set();

    // If skill is in both required and preferred, required takes precedence
    for (const skill of preferredExtraction.allSkills) {
      if (!requiredSkillsSet.has(skill)) {
        preferredSkillsSet.add(skill);
      }
    }

    // Match calculations
    const matchedRequired = [];
    const missingRequired = [];
    for (const skill of requiredSkillsSet) {
      if (resumeSkills.has(skill)) {
        matchedRequired.push(skill);
      } else {
        missingRequired.push(skill);
      }
    }

    const matchedPreferred = [];
    const missingPreferred = [];
    for (const skill of preferredSkillsSet) {
      if (resumeSkills.has(skill)) {
        matchedPreferred.push(skill);
      } else {
        missingPreferred.push(skill);
      }
    }

    // Weighted calculations
    // Formula: match% = (sum of weighted matches) / (sum of weighted totals) * 100
    const REQUIRED_WEIGHT = 1.5;
    const PREFERRED_WEIGHT = 1.0;

    const weightedMatches = (matchedRequired.length * REQUIRED_WEIGHT) + (matchedPreferred.length * PREFERRED_WEIGHT);
    const weightedTotals = (requiredSkillsSet.size * REQUIRED_WEIGHT) + (preferredSkillsSet.size * PREFERRED_WEIGHT);

    let matchPercentage = 0;
    if (weightedTotals > 0) {
      matchPercentage = Math.round((weightedMatches / weightedTotals) * 100);
    } else if (resumeSkills.size > 0) {
      matchPercentage = 0; // JD has no recognizable skills
    }

    // Headline and dial tier
    let tier = 'weak';
    let headline = 'Weak match';
    let dialColor = 'var(--color-gap)'; // coral/red

    if (matchPercentage >= 70) {
      tier = 'strong';
      headline = 'Strong match';
      dialColor = 'var(--color-match)'; // teal/green
    } else if (matchPercentage >= 40) {
      tier = 'partial';
      headline = 'Partial match';
      dialColor = 'var(--color-amber)'; // amber/yellow
    }

    // One-line summary
    let summary = '';
    const totalJdSkills = requiredSkillsSet.size + preferredSkillsSet.size;
    const totalMatched = matchedRequired.length + matchedPreferred.length;

    if (totalJdSkills === 0) {
      summary = 'No recognized skills found in the Job Description. Try adding more technical or domain keywords.';
    } else {
      summary = `Matched ${totalMatched} of ${totalJdSkills} skills (${matchedRequired.length}/${requiredSkillsSet.size} required, ${matchedPreferred.length}/${preferredSkillsSet.size} preferred).`;
    }

    // Category breakdown
    const categoryBreakdown = {};
    for (const category of Object.keys(taxonomy)) {
      const jdCategorySkills = new Set([
        ...(requiredExtraction.skillsByCategory[category] || []),
        ...(preferredExtraction.skillsByCategory[category] || [])
      ]);

      const matchedCategorySkills = [];
      for (const skill of jdCategorySkills) {
        if (resumeSkills.has(skill)) {
          matchedCategorySkills.push(skill);
        }
      }

      const totalInCat = jdCategorySkills.size;
      const matchedInCat = matchedCategorySkills.length;
      const pct = totalInCat > 0 ? Math.round((matchedInCat / totalInCat) * 100) : 0;

      categoryBreakdown[category] = {
        total: totalInCat,
        matched: matchedInCat,
        percentage: pct,
        allSkillsInJd: Array.from(jdCategorySkills),
        matchedSkills: matchedCategorySkills
      };
    }

    // Experience extraction
    const expComparison = compareExperience(resumeText, jdText);

    // Suggestions generator
    const suggestions = generateSuggestions({
      missingRequired,
      missingPreferred,
      expComparison,
      resumeExtraction,
      jdSplit,
      taxonomy
    });

    return {
      matchPercentage,
      weightedMatches,
      weightedTotals,
      tier,
      headline,
      dialColor,
      summary,
      counts: {
        totalJdSkills,
        totalMatched,
        requiredTotal: requiredSkillsSet.size,
        requiredFound: matchedRequired.length,
        requiredMissing: missingRequired.length,
        preferredTotal: preferredSkillsSet.size,
        preferredFound: matchedPreferred.length,
        preferredMissing: missingPreferred.length
      },
      skills: {
        matchedRequired: matchedRequired.sort(),
        missingRequired: missingRequired.sort(),
        matchedPreferred: matchedPreferred.sort(),
        missingPreferred: missingPreferred.sort(),
        resumeOnlySkills: Array.from(resumeSkills).filter(s => !requiredSkillsSet.has(s) && !preferredSkillsSet.has(s)).sort()
      },
      categoryBreakdown,
      expComparison,
      suggestions,
      jdSplit,
      resumeExtraction
    };
  }

  /**
   * Extract Years of Experience from text
   * Pattern matches: "5+ years", "3 years of experience", "4 yrs", etc.
   */
  function extractYearsOfExperience(text) {
    if (!text) return { maxYears: 0, mentions: [] };

    const regex = /(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?experience)?/gi;
    const mentions = [];
    let maxYears = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const years = parseInt(match[1], 10);
      if (!isNaN(years) && years < 50) { // filter out absurd numbers
        mentions.push({ text: match[0], years });
        if (years > maxYears) {
          maxYears = years;
        }
      }
    }

    return { maxYears, mentions };
  }

  /**
   * Compare experience between resume and JD
   */
  function compareExperience(resumeText, jdText) {
    const jdExp = extractYearsOfExperience(jdText);
    const resumeExp = extractYearsOfExperience(resumeText);

    const meetsRequirement = jdExp.maxYears === 0 || resumeExp.maxYears >= jdExp.maxYears;
    const diff = resumeExp.maxYears - jdExp.maxYears;

    return {
      jdYears: jdExp.maxYears,
      resumeYears: resumeExp.maxYears,
      meetsRequirement,
      diff,
      hasJdExp: jdExp.maxYears > 0,
      hasResumeExp: resumeExp.maxYears > 0
    };
  }

  /**
   * Auto-generate prioritized, actionable recommendations
   */
  function generateSuggestions({ missingRequired, missingPreferred, expComparison, resumeExtraction, taxonomy }) {
    const suggestions = [];

    // 1. Missing Required Skills (High Priority)
    if (missingRequired.length > 0) {
      const topRequired = missingRequired.slice(0, 5).join(', ');
      const extraCount = missingRequired.length > 5 ? ` and ${missingRequired.length - 5} more` : '';
      suggestions.push({
        priority: 'high',
        category: 'Required Skills Gap',
        icon: 'alert-triangle',
        title: `Add ${missingRequired.length} Critical Required Skill${missingRequired.length > 1 ? 's' : ''}`,
        description: `Your resume is missing essential requirements specified in the core JD: <strong>${escapeHtml(topRequired)}${extraCount}</strong>. Incorporate these into your work experience bullets or skills summary.`
      });
    }

    // 2. Experience Check
    if (expComparison.hasJdExp) {
      if (!expComparison.hasResumeExp) {
        suggestions.push({
          priority: 'high',
          category: 'Experience Clarity',
          icon: 'calendar',
          title: `Explicitly State Your Total Years of Experience`,
          description: `The job description requires <strong>${expComparison.jdYears}+ years</strong>, but your resume lacks an explicit total years statement (e.g., "${expComparison.jdYears}+ years of software development experience"). Automated ATS scanners look for this exact pattern.`
        });
      } else if (!expComparison.meetsRequirement) {
        suggestions.push({
          priority: 'high',
          category: 'Experience Gap',
          icon: 'clock',
          title: `Experience Threshold Gap: ${expComparison.resumeYears} yrs found vs ${expComparison.jdYears}+ yrs requested`,
          description: `The job specifies <strong>${expComparison.jdYears}+ years</strong>, whereas your resume indicates approximately <strong>${expComparison.resumeYears} years</strong>. Emphasize senior-level scope, projects, and impact to compensate for tenure differences.`
        });
      } else {
        suggestions.push({
          priority: 'pass',
          category: 'Experience Match',
          icon: 'check-circle',
          title: `Experience Requirement Met (${expComparison.resumeYears} yrs detected)`,
          description: `Your stated experience satisfies or exceeds the JD's requirement of ${expComparison.jdYears}+ years.`
        });
      }
    }

    // 3. Missing Preferred Skills (Medium Priority)
    if (missingPreferred.length > 0) {
      const topPreferred = missingPreferred.slice(0, 4).join(', ');
      suggestions.push({
        priority: 'medium',
        category: 'Competitive Edge',
        icon: 'trending-up',
        title: `Include "Nice-to-Have" Bonus Skills`,
        description: `Adding preferred skills like <strong>${escapeHtml(topPreferred)}</strong> can separate your resume from other candidates who only satisfy minimum requirements.`
      });
    }

    // 4. Missing Soft Skills Specifically
    const softSkillsInTaxonomy = Object.keys(taxonomy["Soft skills"] || {});
    const missingSoft = missingRequired.concat(missingPreferred).filter(s => softSkillsInTaxonomy.includes(s));
    if (missingSoft.length > 0) {
      suggestions.push({
        priority: 'medium',
        category: 'Soft Skills Alignment',
        icon: 'users',
        title: `Incorporate Soft Skills Keywords: ${missingSoft.slice(0, 3).join(', ')}`,
        description: `Applicant tracking algorithms and hiring managers search for collaboration and leadership keywords. Frame these within quantifiable achievements (e.g., "Led Agile sprints with cross-functional teams").`
      });
    }

    // 5. Exact Keyword Alignment Tip
    suggestions.push({
      priority: 'low',
      category: 'ATS Optimization',
      icon: 'type',
      title: 'Maintain Strict Keyword Phrasing Consistency',
      description: 'Keep acronyms and technical names identical to the JD. If the JD writes "PostgreSQL", avoid writing only "SQL". Use dual-format phrasing where beneficial (e.g., "Amazon Web Services (AWS)").'
    });

    return suggestions;
  }

  /**
   * Highlight matched skills in original resume text
   * Wraps occurrences in <mark class="matched-skill" ...>
   */
  function highlightResumeText(rawResumeText, matchedSkillsSet, requiredSkillsSet) {
    if (!rawResumeText) return '';

    // Find all matches of the matched skills
    const matchesToHighlight = [];

    for (const skill of matchedSkillsSet) {
      // Find aliases for this skill
      let aliases = [skill];
      for (const catObj of Object.values(SKILLS_TAXONOMY)) {
        if (catObj[skill]) {
          aliases = [skill, ...catObj[skill]];
          break;
        }
      }

      for (const alias of aliases) {
        const regex = createSkillPattern(alias);
        let match;
        while ((match = regex.exec(rawResumeText)) !== null) {
          const isReq = requiredSkillsSet.has(skill);
          matchesToHighlight.push({
            start: match.index,
            end: match.index + match[0].length,
            skill,
            isReq,
            text: match[0]
          });
        }
      }
    }

    if (matchesToHighlight.length === 0) {
      return escapeHtml(rawResumeText);
    }

    // Sort matches by start index ascending
    matchesToHighlight.sort((a, b) => a.start - b.start || b.end - a.end);

    // Merge overlapping intervals
    const nonOverlapping = [];
    let cur = null;
    for (const m of matchesToHighlight) {
      if (!cur) {
        cur = m;
      } else if (m.start < cur.end) {
        // Overlap: keep the longer or preferred
        if (m.end > cur.end) {
          cur.end = m.end;
        }
      } else {
        nonOverlapping.push(cur);
        cur = m;
      }
    }
    if (cur) nonOverlapping.push(cur);

    // Build highlighted HTML
    let lastIdx = 0;
    let html = '';

    for (const m of nonOverlapping) {
      // Unmatched segment before
      html += escapeHtml(rawResumeText.substring(lastIdx, m.start));

      // Highlighted matched segment
      const matchedPart = rawResumeText.substring(m.start, m.end);
      const tagClass = m.isReq ? 'matched-req' : 'matched-pref';
      const label = m.isReq ? 'Required' : 'Preferred';
      html += `<mark class="skill-highlight ${tagClass}" title="${escapeHtml(m.skill)} (${label})">${escapeHtml(matchedPart)}</mark>`;

      lastIdx = m.end;
    }

    html += escapeHtml(rawResumeText.substring(lastIdx));
    return html;
  }

  /**
   * Run structural heuristics on resume text for ATS check
   */
  function runAtsCheck(resumeText) {
    if (!resumeText || resumeText.trim().length === 0) {
      return {
        overallScore: 0,
        checks: [],
        wordCount: 0,
        characterCount: 0
      };
    }

    const lines = resumeText.split(/\r?\n/);
    const words = resumeText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const characterCount = resumeText.length;

    const checks = [];

    // 1. Bullet Points
    const bulletRegex = /^\s*([•\-\*–—]|\d+\.)\s+/;
    let bulletCount = 0;
    for (const line of lines) {
      if (bulletRegex.test(line)) {
        bulletCount++;
      }
    }
    const bulletPass = bulletCount >= 3;
    checks.push({
      id: 'bullets',
      name: 'Bullet Point Usage',
      status: bulletPass ? 'PASS' : 'CHECK',
      metric: `${bulletCount} bullet lines found`,
      note: bulletPass
        ? 'Good structure with scannable bullet points.'
        : 'Found fewer than 3 bullet points. ATS algorithms parse action-oriented bulleted lists best.'
    });

    // 2. Email Address
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = resumeText.match(emailRegex);
    const emailPass = !!emailMatch;
    checks.push({
      id: 'email',
      name: 'Email Address Present',
      status: emailPass ? 'PASS' : 'CHECK',
      metric: emailPass ? emailMatch[0] : 'None detected',
      note: emailPass
        ? 'Valid email address identified.'
        : 'No valid email address found. Recruiters and parsers require contact details.'
    });

    // 3. Phone Number
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = resumeText.match(phoneRegex);
    const phonePass = !!phoneMatch;
    checks.push({
      id: 'phone',
      name: 'Phone Number Present',
      status: phonePass ? 'PASS' : 'CHECK',
      metric: phonePass ? phoneMatch[0] : 'None detected',
      note: phonePass
        ? 'Contact phone number detected.'
        : 'No standard phone format recognized. Ensure your phone number is easily parseable.'
    });

    // 4. Standard Section Headings
    const standardHeadings = ['experience', 'education', 'skills', 'projects', 'summary', 'objective'];
    const foundHeadings = [];
    for (const heading of standardHeadings) {
      const headingRegex = new RegExp(`(?:^|\\n)\\s*(?:[A-Z0-9\\s]{0,5})?${heading}(?:[A-Z0-9\\s]{0,10})?(?:[:\\n]|$)`, 'i');
      if (headingRegex.test(resumeText)) {
        foundHeadings.push(heading);
      }
    }
    const headingsPass = foundHeadings.length >= 2;
    checks.push({
      id: 'headings',
      name: 'Standard Section Headings',
      status: headingsPass ? 'PASS' : 'CHECK',
      metric: `${foundHeadings.length} standard sections found (${foundHeadings.join(', ') || 'none'})`,
      note: headingsPass
        ? 'Common resume sections identified for ATS categorization.'
        : 'Found fewer than 2 standard headings. Include conventional sections like "Experience", "Skills", and "Education".'
    });

    // 5. Word Count (250 - 900 words)
    let wordCountStatus = 'PASS';
    let wordNote = 'Word count is within the optimal 1-2 page standard range (~250–900 words).';
    if (wordCount < 250) {
      wordCountStatus = 'CHECK';
      wordNote = 'Resume is too brief (<250 words). Provide more detailed accomplishments and technical scope.';
    } else if (wordCount > 900) {
      wordCountStatus = 'CHECK';
      wordNote = 'Resume may be too lengthy (>900 words). Consider condensing to 1–2 pages for optimal ATS readability.';
    }
    checks.push({
      id: 'wordCount',
      name: 'Optimal Word Count Range',
      status: wordCountStatus,
      metric: `${wordCount} words`,
      note: wordNote
    });

    // Calculate overall ATS score
    const passCount = checks.filter(c => c.status === 'PASS').length;
    const overallScore = Math.round((passCount / checks.length) * 100);

    return {
      overallScore,
      passCount,
      totalChecks: checks.length,
      checks,
      wordCount,
      characterCount
    };
  }

  /**
   * Generates a plain-text report for export or preview
   */
  function generatePlainTextReport(analysisResult, atsResult, jdTitle = 'Target Job Description') {
    const divider = '═'.repeat(60);
    const subDivider = '─'.repeat(60);
    const timestamp = new Date().toLocaleString();

    let r = '';
    r += `${divider}\n`;
    r += ` MATCH / GAP — SMART RESUME ANALYZER & JOB MATCHING REPORT\n`;
    r += ` Generated: ${timestamp}\n`;
    r += `${divider}\n\n`;

    r += `[ 1. OVERALL MATCH SCORE ]\n`;
    r += `Score:            ${analysisResult.matchPercentage}% (${analysisResult.headline})\n`;
    r += `Formula:          Weighted matches / Weighted totals * 100\n`;
    r += `Weights:          Required Skills = 1.5x | Preferred Skills = 1.0x\n`;
    r += `Summary:          ${analysisResult.summary}\n\n`;

    r += `[ 2. SKILLS BREAKDOWN ]\n`;
    r += `• Required Skills:  ${analysisResult.counts.requiredFound} / ${analysisResult.counts.requiredTotal} matched (${analysisResult.counts.requiredMissing} missing)\n`;
    r += `• Preferred Skills: ${analysisResult.counts.preferredFound} / ${analysisResult.counts.preferredTotal} matched (${analysisResult.counts.preferredMissing} missing)\n`;
    r += `• Total Match Rate: ${analysisResult.counts.totalMatched} / ${analysisResult.counts.totalJdSkills} skills found\n\n`;

    r += `[ 3. MATCHED SKILLS ]\n`;
    if (analysisResult.skills.matchedRequired.length > 0) {
      r += `Required Matched:  ${analysisResult.skills.matchedRequired.join(', ')}\n`;
    }
    if (analysisResult.skills.matchedPreferred.length > 0) {
      r += `Preferred Matched: ${analysisResult.skills.matchedPreferred.join(', ')}\n`;
    }
    if (analysisResult.skills.matchedRequired.length === 0 && analysisResult.skills.matchedPreferred.length === 0) {
      r += `No direct skill matches found in resume for this JD.\n`;
    }
    r += `\n`;

    r += `[ 4. MISSING SKILLS / GAPS ]\n`;
    if (analysisResult.skills.missingRequired.length > 0) {
      r += `PRIORITY MISSING (Required):\n`;
      analysisResult.skills.missingRequired.forEach(skill => {
        r += `  [!] ${skill}\n`;
      });
    }
    if (analysisResult.skills.missingPreferred.length > 0) {
      r += `SECONDARY MISSING (Preferred):\n`;
      analysisResult.skills.missingPreferred.forEach(skill => {
        r += `  [-] ${skill}\n`;
      });
    }
    r += `\n`;

    r += `[ 5. CATEGORY COVERAGE ]\n`;
    for (const [cat, data] of Object.entries(analysisResult.categoryBreakdown)) {
      if (data.total > 0) {
        const barLength = Math.round(data.percentage / 5);
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
        r += `${cat.padEnd(16)} [${bar}] ${data.percentage}% (${data.matched}/${data.total})\n`;
      }
    }
    r += `\n`;

    if (analysisResult.expComparison.hasJdExp) {
      r += `[ 6. YEARS OF EXPERIENCE ]\n`;
      r += `• JD Required:   ${analysisResult.expComparison.jdYears}+ years\n`;
      r += `• Resume Stated: ${analysisResult.expComparison.resumeYears > 0 ? analysisResult.expComparison.resumeYears + ' years' : 'Not explicitly found'}\n`;
      r += `• Status:        ${analysisResult.expComparison.meetsRequirement ? 'SATISFIES REQUIREMENT' : 'DOES NOT MEET REQUIREMENT'}\n\n`;
    }

    if (atsResult) {
      r += `[ 7. ATS FORMAT HEURISTICS ]\n`;
      r += `Overall ATS Score: ${atsResult.overallScore}% (${atsResult.passCount}/${atsResult.totalChecks} checks passed)\n`;
      for (const chk of atsResult.checks) {
        r += `  [${chk.status}] ${chk.name.padEnd(26)} -> ${chk.metric}\n`;
      }
      r += `\n`;
    }

    r += `[ 8. ACTIONABLE RECOMMENDATIONS ]\n`;
    analysisResult.suggestions.forEach((sug, i) => {
      r += `${i + 1}. [${sug.priority.toUpperCase()}] ${sug.title}\n`;
      r += `   ${sug.description.replace(/<[^>]*>?/gm, '')}\n\n`;
    });

    r += `${subDivider}\n`;
    r += `End of Match/Gap Analysis Report\n`;
    r += `${divider}\n`;

    return r;
  }

  // Public API
  return {
    extractSkills,
    splitJobDescription,
    analyzeMatch,
    extractYearsOfExperience,
    compareExperience,
    generateSuggestions,
    highlightResumeText,
    runAtsCheck,
    generatePlainTextReport,
    escapeHtml
  };
})();
