/**
 * Match / Gap — Application Controller & UI State
 * Coordinates user input, reactive updates, dashboard rendering,
 * and secondary feature modules.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Current Application State
  const state = {
    currentAnalysis: null,
    currentAtsResult: null,
    activeView: 'analyzer',
    theme: 'dark'
  };

  // DOM Elements - Navigation & Header
  const tabButtons = document.querySelectorAll('.tab-btn');
  const viewSections = document.querySelectorAll('.view-section');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIconDark = document.getElementById('themeIconDark');
  const themeIconLight = document.getElementById('themeIconLight');
  const samplePresetSelect = document.getElementById('samplePresetSelect');
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');

  // DOM Elements - Main Analyzer Input
  const resumeInput = document.getElementById('resumeInput');
  const jdInput = document.getElementById('jdInput');
  const resumeCharCount = document.getElementById('resumeCharCount');
  const resumeWordCount = document.getElementById('resumeWordCount');
  const jdCharCount = document.getElementById('jdCharCount');
  const jdWordCount = document.getElementById('jdWordCount');
  const resumeIndicator = document.getElementById('resumeIndicator');
  const jdIndicator = document.getElementById('jdIndicator');
  const resumeExtractedMini = document.getElementById('resumeExtractedMini');
  const jdExtractedMini = document.getElementById('jdExtractedMini');
  const validationStatus = document.getElementById('validationStatus');
  const validationStatusIcon = document.getElementById('validationStatusIcon');
  const validationStatusText = document.getElementById('validationStatusText');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const btnClearAll = document.getElementById('btnClearAll');
  const btnClearResume = document.getElementById('btnClearResume');
  const btnClearJd = document.getElementById('btnClearJd');
  const btnUploadResume = document.getElementById('btnUploadResume');
  const btnUploadJd = document.getElementById('btnUploadJd');
  const resumeFileInput = document.getElementById('resumeFileInput');
  const jdFileInput = document.getElementById('jdFileInput');

  // DOM Elements - Results Dashboard
  const resultsDashboard = document.getElementById('resultsDashboard');
  const scoreDialCircle = document.getElementById('scoreDialCircle');
  const scorePercentageText = document.getElementById('scorePercentageText');
  const scoreBadge = document.getElementById('scoreBadge');
  const scoreHeadlineTitle = document.getElementById('scoreHeadlineTitle');
  const scoreSummaryLine = document.getElementById('scoreSummaryLine');
  const statRequiredRatio = document.getElementById('statRequiredRatio');
  const statRequiredPct = document.getElementById('statRequiredPct');
  const statPreferredRatio = document.getElementById('statPreferredRatio');
  const statPreferredPct = document.getElementById('statPreferredPct');
  const statTotalMatchedRatio = document.getElementById('statTotalMatchedRatio');
  const statTotalMissing = document.getElementById('statTotalMissing');
  const statExpStatus = document.getElementById('statExpStatus');
  const statExpDetail = document.getElementById('statExpDetail');
  const categoryBarsList = document.getElementById('categoryBarsList');
  const matchedCountBadge = document.getElementById('matchedCountBadge');
  const missingCountBadge = document.getElementById('missingCountBadge');
  const matchedChipsCloud = document.getElementById('matchedChipsCloud');
  const missingChipsCloud = document.getElementById('missingChipsCloud');
  const suggestionsList = document.getElementById('suggestionsList');
  const suggestionsCountBadge = document.getElementById('suggestionsCountBadge');
  const highlightedResumeBox = document.getElementById('highlightedResumeBox');
  const tabMissingCountBadge = document.getElementById('tabMissingCountBadge');

  // DOM Elements - Multi-JD View
  const multiJd1 = document.getElementById('multiJd1');
  const multiJd2 = document.getElementById('multiJd2');
  const multiJd3 = document.getElementById('multiJd3');
  const jd1CharCount = document.getElementById('jd1CharCount');
  const jd2CharCount = document.getElementById('jd2CharCount');
  const jd3CharCount = document.getElementById('jd3CharCount');
  const btnLoadMultiPresets = document.getElementById('btnLoadMultiPresets');
  const btnRunMultiComparison = document.getElementById('btnRunMultiComparison');
  const multiJdResultsContainer = document.getElementById('multiJdResultsContainer');
  const bestFitTitle = document.getElementById('bestFitTitle');
  const bestFitSummary = document.getElementById('bestFitSummary');
  const jdComparisonList = document.getElementById('jdComparisonList');

  // DOM Elements - ATS Check View
  const atsScoreCircle = document.getElementById('atsScoreCircle');
  const atsScoreNum = document.getElementById('atsScoreNum');
  const atsHeadline = document.getElementById('atsHeadline');
  const atsChecksSummaryBadge = document.getElementById('atsChecksSummaryBadge');
  const atsChecklistContainer = document.getElementById('atsChecklistContainer');

  // DOM Elements - Learning Resources View
  const resourceFilterSelect = document.getElementById('resourceFilterSelect');
  const resourcesGrid = document.getElementById('resourcesGrid');

  // DOM Elements - Report View
  const reportPreviewCode = document.getElementById('reportPreviewCode');
  const btnDownloadReport = document.getElementById('btnDownloadReport');
  const btnCopyReport = document.getElementById('btnCopyReport');

  // DOM Elements - Hero Landing Page
  const btnHeroGetStarted = document.getElementById('btnHeroGetStarted');
  const btnHeroBottomGetStarted = document.getElementById('btnHeroBottomGetStarted');
  const btnHeroDemo = document.getElementById('btnHeroDemo');
  const btnHeroMultiJd = document.getElementById('btnHeroMultiJd');

  /* ==========================================================================
     Theme & View Navigation
     ========================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem('matchgap_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('matchgap_theme', theme);

    if (theme === 'light') {
      themeIconDark.style.display = 'none';
      themeIconLight.style.display = 'block';
    } else {
      themeIconDark.style.display = 'block';
      themeIconLight.style.display = 'none';
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  function switchTab(viewId) {
    state.activeView = viewId;

    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    viewSections.forEach(sec => {
      sec.classList.remove('active-view');
    });

    const targetSection = document.getElementById(`view${viewId.charAt(0).toUpperCase() + viewId.slice(1)}`);
    if (targetSection) {
      targetSection.classList.add('active-view');
    }

    // Lazy renders if switched directly
    if (viewId === 'atsCheck' && state.currentAtsResult) {
      renderAtsCheck(state.currentAtsResult);
    } else if (viewId === 'learningResources' && state.currentAnalysis) {
      renderLearningResources(state.currentAnalysis);
    } else if (viewId === 'report' && state.currentAnalysis) {
      renderReportPreview(state.currentAnalysis, state.currentAtsResult);
    }
  }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchTab(view);
      });
    });

    // Hero Landing Actions
    function navigateToAnalyzer(andFocus = true) {
      switchTab('analyzer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (andFocus) {
        setTimeout(() => resumeInput.focus(), 250);
      }
    }

    if (btnHeroGetStarted) {
      btnHeroGetStarted.addEventListener('click', () => navigateToAnalyzer(true));
    }
    if (btnHeroBottomGetStarted) {
      btnHeroBottomGetStarted.addEventListener('click', () => navigateToAnalyzer(true));
    }
    if (btnHeroDemo) {
      btnHeroDemo.addEventListener('click', () => {
        loadPreset('fullstack');
        switchTab('analyzer');
      });
    }
    if (btnHeroMultiJd) {
      btnHeroMultiJd.addEventListener('click', () => {
        switchTab('multiJd');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

  /* ==========================================================================
     Toast Notification Utility
     ========================================================================== */
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toastNotice.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     Input Validation & Counters
     ========================================================================== */
  function countWords(str) {
    if (!str) return 0;
    const words = str.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  }

  function updateInputMetrics() {
    const resumeText = resumeInput.value;
    const jdText = jdInput.value;

    const rChars = resumeText.length;
    const rWords = countWords(resumeText);
    const jChars = jdText.length;
    const jWords = countWords(jdText);

    resumeCharCount.textContent = rChars.toLocaleString();
    resumeWordCount.textContent = rWords.toLocaleString();
    jdCharCount.textContent = jChars.toLocaleString();
    jdWordCount.textContent = jWords.toLocaleString();

    const isResumeValid = rChars >= 20;
    const isJdValid = jChars >= 20;

    resumeIndicator.classList.toggle('valid', isResumeValid);
    jdIndicator.classList.toggle('valid', isJdValid);

    // Live skill detection chips in input panels
    renderMiniExtractedSkills(resumeText, resumeExtractedMini);
    renderMiniExtractedSkills(jdText, jdExtractedMini);

    if (isResumeValid && isJdValid) {
      analyzeBtn.removeAttribute('disabled');
      validationStatus.className = 'validation-status ready';
      validationStatusIcon.textContent = '✓';
      validationStatusText.textContent = 'Both inputs ready. Click "Analyze Match" to generate full report.';
    } else {
      analyzeBtn.setAttribute('disabled', 'true');
      validationStatus.className = 'validation-status waiting';
      validationStatusIcon.textContent = '!';

      let msg = '';
      if (!isResumeValid && !isJdValid) {
        msg = 'Both fields need 20+ characters before analysis is enabled.';
      } else if (!isResumeValid) {
        msg = `Resume text is too short (${rChars}/20 characters).`;
      } else {
        msg = `Job description is too short (${jChars}/20 characters).`;
      }
      validationStatusText.textContent = msg;
    }
  }

  function renderMiniExtractedSkills(text, container) {
    if (!text || text.trim().length < 5) {
      container.innerHTML = '<span class="chip-empty-placeholder">Type or paste text to detect skills...</span>';
      return;
    }

    const extraction = MatchGapEngine.extractSkills(text);
    const skills = Array.from(extraction.allSkills);

    if (skills.length === 0) {
      container.innerHTML = '<span class="chip-empty-placeholder">No taxonomy terms detected yet</span>';
      return;
    }

    // Show up to 8 detected skills chips
    const displaySkills = skills.slice(0, 8);
    const remainder = skills.length - displaySkills.length;

    let html = displaySkills.map(s => `<span class="mini-chip">${MatchGapEngine.escapeHtml(s)}</span>`).join('');
    if (remainder > 0) {
      html += `<span class="mini-chip" style="opacity:0.7;">+${remainder} more</span>`;
    }
    container.innerHTML = html;
  }

  resumeInput.addEventListener('input', updateInputMetrics);
  jdInput.addEventListener('input', updateInputMetrics);

  // File Upload Handlers (.txt)
  btnUploadResume.addEventListener('click', () => resumeFileInput.click());
  btnUploadJd.addEventListener('click', () => jdFileInput.click());

  resumeFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      readFileInto(file, resumeInput);
    }
  });

  jdFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      readFileInto(file, jdInput);
    }
  });

  function readFileInto(file, targetTextarea) {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      showToast('Please select a plain-text (.txt) file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      targetTextarea.value = evt.target.result;
      updateInputMetrics();
      showToast(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      showToast('Error reading file.');
    };
    reader.readAsText(file);
  }

  // Clear Handlers
  btnClearResume.addEventListener('click', () => {
    resumeInput.value = '';
    updateInputMetrics();
  });

  btnClearJd.addEventListener('click', () => {
    jdInput.value = '';
    updateInputMetrics();
  });

  btnClearAll.addEventListener('click', () => {
    resumeInput.value = '';
    jdInput.value = '';
    resultsDashboard.style.display = 'none';
    samplePresetSelect.value = '';
    updateInputMetrics();
    showToast('Inputs cleared');
  });

  /* ==========================================================================
     Sample Presets Loader
     ========================================================================== */
  function loadPreset(presetKey) {
    if (!presetKey || !SAMPLE_PRESETS[presetKey]) {
      return;
    }

    const preset = SAMPLE_PRESETS[presetKey];
    resumeInput.value = preset.resume;
    jdInput.value = preset.jd;
    updateInputMetrics();

    // Auto-analyze upon selecting preset
    runAnalysis();
    showToast(`Loaded "${preset.name}"`);
  }

  samplePresetSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      loadPreset(e.target.value);
      switchTab('analyzer');
    }
  });

  /* ==========================================================================
     Core Analysis & Results Rendering
     ========================================================================== */
  function runAnalysis() {
    const resumeText = resumeInput.value.trim();
    const jdText = jdInput.value.trim();

    if (resumeText.length < 20 || jdText.length < 20) {
      showToast('Both fields must have at least 20 characters.');
      return;
    }

    // 1. Run Core Match Engine
    const analysis = MatchGapEngine.analyzeMatch(resumeText, jdText, SKILLS_TAXONOMY);
    state.currentAnalysis = analysis;

    // 2. Run ATS Structural Heuristics
    const atsResult = MatchGapEngine.runAtsCheck(resumeText);
    state.currentAtsResult = atsResult;

    // 3. Render Dashboard Sections
    renderScoreDial(analysis);
    renderCategoryBreakdown(analysis.categoryBreakdown);
    renderSkillsChips(analysis);
    renderSuggestions(analysis.suggestions);
    renderHighlightedResume(resumeText, analysis);

    // 4. Update Secondary Module Caches
    renderAtsCheck(atsResult);
    renderLearningResources(analysis);
    renderReportPreview(analysis, atsResult);

    // Update missing gaps count badge on nav
    const totalMissing = analysis.counts.requiredMissing + analysis.counts.preferredMissing;
    tabMissingCountBadge.textContent = `${totalMissing} Gap${totalMissing !== 1 ? 's' : ''}`;

    // Reveal Dashboard smoothly
    resultsDashboard.style.display = 'flex';

    // Smooth scroll down to results
    resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  analyzeBtn.addEventListener('click', runAnalysis);

  /* Section 1: Score Row & Dial */
  function renderScoreDial(analysis) {
    const pct = analysis.matchPercentage;

    // SVG Dial circumference calculation
    // Circle r=60 => circumference = 2 * PI * 60 = 376.99
    const circumference = 377;
    const offset = circumference - (pct / 100) * circumference;

    // Smooth stroke animation
    scoreDialCircle.style.strokeDasharray = circumference;
    scoreDialCircle.style.strokeDashoffset = offset;
    scoreDialCircle.style.stroke = analysis.dialColor;

    // Animated number counter
    animateNumber(scorePercentageText, pct, '%');

    // Headline & Badge
    scoreBadge.className = `headline-badge ${analysis.tier}`;
    scoreBadge.textContent = analysis.headline;
    scoreHeadlineTitle.textContent = `${analysis.headline} (${pct}%)`;
    scoreSummaryLine.textContent = analysis.summary;

    // Score KPIs
    const reqFound = analysis.counts.requiredFound;
    const reqTotal = analysis.counts.requiredTotal;
    const reqPct = reqTotal > 0 ? Math.round((reqFound / reqTotal) * 100) : 0;
    statRequiredRatio.textContent = `${reqFound} / ${reqTotal}`;
    statRequiredPct.textContent = `${reqPct}% matched`;

    const prefFound = analysis.counts.preferredFound;
    const prefTotal = analysis.counts.preferredTotal;
    const prefPct = prefTotal > 0 ? Math.round((prefFound / prefTotal) * 100) : 0;
    statPreferredRatio.textContent = `${prefFound} / ${prefTotal}`;
    statPreferredPct.textContent = `${prefPct}% matched`;

    const totalFound = analysis.counts.totalMatched;
    const totalJd = analysis.counts.totalJdSkills;
    const totalMissing = analysis.counts.requiredMissing + analysis.counts.preferredMissing;
    statTotalMatchedRatio.textContent = `${totalFound} / ${totalJd}`;
    statTotalMissing.textContent = `${totalMissing} skill gap${totalMissing !== 1 ? 's' : ''}`;

    // Experience status
    if (analysis.expComparison.hasJdExp) {
      if (analysis.expComparison.meetsRequirement) {
        statExpStatus.textContent = 'Meets Req';
        statExpStatus.style.color = 'var(--color-match)';
        statExpDetail.textContent = `${analysis.expComparison.resumeYears} yrs found (req: ${analysis.expComparison.jdYears}+)`;
      } else {
        statExpStatus.textContent = 'Gap Flagged';
        statExpStatus.style.color = 'var(--color-gap)';
        statExpDetail.textContent = `${analysis.expComparison.resumeYears} yrs vs ${analysis.expComparison.jdYears}+ req`;
      }
    } else {
      statExpStatus.textContent = 'Unspecified';
      statExpStatus.style.color = 'var(--text-secondary)';
      statExpDetail.textContent = 'No strict YOE specified in JD';
    }
  }

  function animateNumber(element, target, suffix = '') {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic out
      const currentVal = Math.round(start + (target - start) * ease);
      element.textContent = `${currentVal}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  /* Section 2: Category Breakdown */
  function renderCategoryBreakdown(categories) {
    categoryBarsList.innerHTML = '';

    for (const [catName, data] of Object.entries(categories)) {
      const row = document.createElement('div');
      row.className = 'category-bar-row';

      const isZeroJd = data.total === 0;
      const fillClass = isZeroJd ? 'progress-fill empty' : 'progress-fill';
      const widthVal = isZeroJd ? '0%' : `${data.percentage}%`;

      row.innerHTML = `
        <span class="cat-name" title="${MatchGapEngine.escapeHtml(catName)}">${MatchGapEngine.escapeHtml(catName)}</span>
        <div class="progress-track" title="${data.matched} of ${data.total} skills covered">
          <div class="${fillClass}" style="width: ${widthVal};"></div>
        </div>
        <div class="cat-stat">
          <strong>${data.percentage}%</strong>
          <span style="font-size:0.7rem; color:var(--text-muted);">(${data.matched}/${data.total})</span>
        </div>
      `;
      categoryBarsList.appendChild(row);
    }
  }

  /* Sections 3 & 4: Matched & Missing Chips */
  function renderSkillsChips(analysis) {
    matchedChipsCloud.innerHTML = '';
    missingChipsCloud.innerHTML = '';

    const matchedReq = analysis.skills.matchedRequired;
    const matchedPref = analysis.skills.matchedPreferred;
    const missingReq = analysis.skills.missingRequired;
    const missingPref = analysis.skills.missingPreferred;

    const totalMatched = matchedReq.length + matchedPref.length;
    const totalMissing = missingReq.length + missingPref.length;

    matchedCountBadge.textContent = `${totalMatched} Matched`;
    missingCountBadge.textContent = `${totalMissing} Missing`;

    // Render Matched Chips
    if (totalMatched === 0) {
      matchedChipsCloud.innerHTML = '<span class="chip-empty-placeholder">No matching skills detected between resume and JD.</span>';
    } else {
      matchedReq.forEach(skill => {
        const chip = createSkillChip(skill, 'match', 'req');
        matchedChipsCloud.appendChild(chip);
      });
      matchedPref.forEach(skill => {
        const chip = createSkillChip(skill, 'match', 'pref');
        matchedChipsCloud.appendChild(chip);
      });
    }

    // Render Missing Chips
    if (totalMissing === 0) {
      missingChipsCloud.innerHTML = '<span class="chip-empty-placeholder">Zero gaps! Resume matches 100% of the job description skills.</span>';
    } else {
      missingReq.forEach(skill => {
        const chip = createSkillChip(skill, 'gap', 'req');
        // Click missing chip to view learning resources
        chip.style.cursor = 'pointer';
        chip.title = 'Click to view learning resources for this skill';
        chip.addEventListener('click', () => {
          switchTab('learningResources');
          filterLearningResources(skill);
        });
        missingChipsCloud.appendChild(chip);
      });

      missingPref.forEach(skill => {
        const chip = createSkillChip(skill, 'gap', 'pref');
        chip.style.cursor = 'pointer';
        chip.title = 'Click to view learning resources for this skill';
        chip.addEventListener('click', () => {
          switchTab('learningResources');
          filterLearningResources(skill);
        });
        missingChipsCloud.appendChild(chip);
      });
    }
  }

  function createSkillChip(skillName, matchType, tagType) {
    const chip = document.createElement('div');
    chip.className = `chip chip-${matchType}`;

    const label = tagType === 'req' ? 'REQ' : 'PREF';
    chip.innerHTML = `
      <span>${MatchGapEngine.escapeHtml(skillName)}</span>
      <span class="chip-tag ${tagType}">${label}</span>
    `;
    return chip;
  }

  /* Section 5: Prioritized Suggestions */
  function renderSuggestions(suggestions) {
    suggestionsList.innerHTML = '';
    suggestionsCountBadge.textContent = `${suggestions.length} Recommendation${suggestions.length !== 1 ? 's' : ''}`;

    if (suggestions.length === 0) {
      suggestionsList.innerHTML = '<p class="chip-empty-placeholder">No actionable gaps found. High alignment detected.</p>';
      return;
    }

    suggestions.forEach(sug => {
      const item = document.createElement('div');
      item.className = `suggestion-item priority-${sug.priority}`;

      item.innerHTML = `
        <div style="flex:1;">
          <span class="suggestion-badge">${MatchGapEngine.escapeHtml(sug.category)}</span>
          <h4 class="suggestion-title">${MatchGapEngine.escapeHtml(sug.title)}</h4>
          <p class="suggestion-desc">${sug.description}</p>
        </div>
      `;
      suggestionsList.appendChild(item);
    });
  }

  /* Section 6: Highlighted Resume View */
  function renderHighlightedResume(rawResume, analysis) {
    const matchedSkills = new Set([
      ...analysis.skills.matchedRequired,
      ...analysis.skills.matchedPreferred
    ]);
    const requiredSkills = new Set(analysis.skills.matchedRequired);

    const html = MatchGapEngine.highlightResumeText(rawResume, matchedSkills, requiredSkills);
    highlightedResumeBox.innerHTML = html;
  }

  /* ==========================================================================
     Secondary Module: Multi-JD Comparison
     ========================================================================== */
  function updateMultiJdCounters() {
    jd1CharCount.textContent = `${multiJd1.value.length} chars`;
    jd2CharCount.textContent = `${multiJd2.value.length} chars`;
    jd3CharCount.textContent = `${multiJd3.value.length} chars`;
  }

  multiJd1.addEventListener('input', updateMultiJdCounters);
  multiJd2.addEventListener('input', updateMultiJdCounters);
  multiJd3.addEventListener('input', updateMultiJdCounters);

  btnLoadMultiPresets.addEventListener('click', () => {
    multiJd1.value = SAMPLE_PRESETS.fullstack.jd;
    multiJd2.value = SAMPLE_PRESETS.ml_engineer.jd;
    multiJd3.value = SAMPLE_PRESETS.devops_cloud.jd;
    updateMultiJdCounters();
    runMultiJdComparison();
    showToast('Loaded 3 sample job descriptions');
  });

  function runMultiJdComparison() {
    const resumeText = resumeInput.value.trim();
    if (resumeText.length < 20) {
      showToast('Please provide a resume in the Main Analyzer first.');
      switchTab('analyzer');
      return;
    }

    const jds = [
      { id: 1, title: 'Job Description 1 (Target Role A)', text: multiJd1.value.trim() },
      { id: 2, title: 'Job Description 2 (Target Role B)', text: multiJd2.value.trim() },
      { id: 3, title: 'Job Description 3 (Target Role C)', text: multiJd3.value.trim() }
    ];

    const validJds = jds.filter(j => j.text.length >= 20);
    if (validJds.length === 0) {
      showToast('Please enter at least one job description (20+ chars) to compare.');
      return;
    }

    // Run independent analysis for each JD
    const results = validJds.map(jd => {
      const analysis = MatchGapEngine.analyzeMatch(resumeText, jd.text, SKILLS_TAXONOMY);
      return {
        ...jd,
        analysis
      };
    });

    // Find the winner (highest match percentage)
    results.sort((a, b) => b.analysis.matchPercentage - a.analysis.matchPercentage);
    const winner = results[0];

    // Update Best Fit Banner
    bestFitTitle.textContent = `★ Best Fit: ${winner.title} (${winner.analysis.matchPercentage}% Match)`;
    bestFitSummary.textContent = `Matched ${winner.analysis.counts.totalMatched} of ${winner.analysis.counts.totalJdSkills} skills (${winner.analysis.counts.requiredFound}/${winner.analysis.counts.requiredTotal} required).`;

    // Render Comparative Rows
    jdComparisonList.innerHTML = '';
    results.forEach((item, index) => {
      const isWinner = index === 0;
      const an = item.analysis;
      const row = document.createElement('div');
      row.className = `jd-compare-row ${isWinner ? 'winner' : ''}`;

      const barColor = isWinner ? 'var(--color-match)' : (an.matchPercentage >= 40 ? 'var(--color-amber)' : 'var(--color-gap)');

      row.innerHTML = `
        <div class="jd-row-top">
          <div class="jd-row-title-wrap">
            <strong>${MatchGapEngine.escapeHtml(item.title)}</strong>
            ${isWinner ? '<span class="winner-badge">★ Best Fit</span>' : ''}
          </div>
          <span class="jd-score-large" style="color:${barColor};">${an.matchPercentage}%</span>
        </div>

        <div class="jd-compare-bar-track">
          <div class="jd-compare-bar-fill" style="width: ${an.matchPercentage}%; background-color: ${barColor};"></div>
        </div>

        <div class="jd-row-meta">
          <span>Required Skills: <strong>${an.counts.requiredFound}/${an.counts.requiredTotal}</strong></span>
          <span>Preferred Skills: <strong>${an.counts.preferredFound}/${an.counts.preferredTotal}</strong></span>
          <span>Missing Gaps: <strong>${an.counts.requiredMissing + an.counts.preferredMissing}</strong></span>
          <button type="button" class="btn-sm" data-load-jd="${item.id}" style="margin-left:auto;">
            Load into Main Analyzer →
          </button>
        </div>
      `;

      // Quick action to load this JD into Main Analyzer
      const loadBtn = row.querySelector('[data-load-jd]');
      loadBtn.addEventListener('click', () => {
        jdInput.value = item.text;
        updateInputMetrics();
        switchTab('analyzer');
        runAnalysis();
        showToast(`Loaded ${item.title} into Main Analyzer`);
      });

      jdComparisonList.appendChild(row);
    });

    multiJdResultsContainer.style.display = 'block';
  }

  btnRunMultiComparison.addEventListener('click', runMultiJdComparison);

  /* ==========================================================================
     Secondary Module: ATS Format Check
     ========================================================================== */
  function renderAtsCheck(atsResult) {
    if (!atsResult) return;

    atsScoreNum.textContent = `${atsResult.overallScore}%`;
    atsChecksSummaryBadge.textContent = `${atsResult.passCount} / ${atsResult.totalChecks} Passed`;

    if (atsResult.overallScore >= 80) {
      atsScoreCircle.style.borderColor = 'var(--color-match)';
      atsHeadline.textContent = `Excellent ATS Readability (${atsResult.overallScore}%)`;
    } else if (atsResult.overallScore >= 60) {
      atsScoreCircle.style.borderColor = 'var(--color-amber)';
      atsHeadline.textContent = `Moderate ATS Formatting (${atsResult.overallScore}%)`;
    } else {
      atsScoreCircle.style.borderColor = 'var(--color-gap)';
      atsHeadline.textContent = `Formatting Warnings Detected (${atsResult.overallScore}%)`;
    }

    atsChecklistContainer.innerHTML = '';
    atsResult.checks.forEach(chk => {
      const isPass = chk.status === 'PASS';
      const badgeClass = isPass ? 'badge-pass' : 'badge-check';
      const row = document.createElement('div');
      row.className = 'ats-check-row';

      row.innerHTML = `
        <div class="ats-check-info">
          <div class="ats-check-title-wrap">
            <span class="${badgeClass}">${chk.status}</span>
            <span class="ats-check-name">${MatchGapEngine.escapeHtml(chk.name)}</span>
          </div>
          <p class="ats-check-note">${MatchGapEngine.escapeHtml(chk.note)}</p>
        </div>
        <div class="ats-check-metric">${MatchGapEngine.escapeHtml(chk.metric)}</div>
      `;
      atsChecklistContainer.appendChild(row);
    });
  }

  /* ==========================================================================
     Secondary Module: Learning Resources
     ========================================================================== */
  function renderLearningResources(analysis, filterKeyword = null) {
    if (!analysis) return;

    const filterVal = resourceFilterSelect.value;
    resourcesGrid.innerHTML = '';

    const reqMissing = analysis.skills.missingRequired.map(s => ({ name: s, tag: 'req' }));
    const prefMissing = analysis.skills.missingPreferred.map(s => ({ name: s, tag: 'pref' }));

    let allMissing = [];
    if (filterVal === 'required') {
      allMissing = reqMissing;
    } else if (filterVal === 'preferred') {
      allMissing = prefMissing;
    } else {
      allMissing = [...reqMissing, ...prefMissing];
    }

    if (filterKeyword) {
      allMissing = allMissing.filter(m => m.name.toLowerCase().includes(filterKeyword.toLowerCase()));
    }

    if (allMissing.length === 0) {
      resourcesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
          No missing skills match the selected filter.
        </div>
      `;
      return;
    }

    allMissing.forEach(item => {
      const skill = item.name;
      const isReq = item.tag === 'req';

      // Look up curated resource or generate search fallback
      let resData = CURATED_RESOURCES[skill];
      if (!resData) {
        // Fallback to freeCodeCamp / DevDocs search link
        resData = {
          title: `Learn ${skill.toUpperCase()} — Tutorials & Guides`,
          url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(skill)}`,
          source: 'freeCodeCamp Search'
        };
      }

      const card = document.createElement('div');
      card.className = 'resource-card';

      card.innerHTML = `
        <div class="resource-card-top">
          <div class="resource-skill-header">
            <span class="resource-skill-name">${MatchGapEngine.escapeHtml(skill)}</span>
            <span class="resource-tag ${item.tag}">${isReq ? 'Required Gap' : 'Preferred Gap'}</span>
          </div>
          <h4 class="resource-title">${MatchGapEngine.escapeHtml(resData.title)}</h4>
          <span class="resource-source">${MatchGapEngine.escapeHtml(resData.source)}</span>
        </div>
        <a href="${resData.url}" target="_blank" rel="noopener noreferrer" class="resource-link-btn">
          Free resource →
        </a>
      `;

      resourcesGrid.appendChild(card);
    });
  }

  function filterLearningResources(skillName) {
    resourceFilterSelect.value = 'all';
    renderLearningResources(state.currentAnalysis, skillName);
  }

  resourceFilterSelect.addEventListener('change', () => {
    renderLearningResources(state.currentAnalysis);
  });

  /* ==========================================================================
     Secondary Module: Downloadable Plain-Text Report
     ========================================================================== */
  function renderReportPreview(analysis, atsResult) {
    if (!analysis) return;
    const reportText = MatchGapEngine.generatePlainTextReport(analysis, atsResult);
    reportPreviewCode.textContent = reportText;
  }

  btnDownloadReport.addEventListener('click', () => {
    if (!state.currentAnalysis) {
      showToast('Run an analysis first to download a report.');
      return;
    }

    const reportText = MatchGapEngine.generatePlainTextReport(state.currentAnalysis, state.currentAtsResult);
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-gap-analysis-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Report downloaded successfully!');
  });

  btnCopyReport.addEventListener('click', () => {
    if (!state.currentAnalysis) {
      showToast('Run an analysis first to copy a report.');
      return;
    }

    const reportText = MatchGapEngine.generatePlainTextReport(state.currentAnalysis, state.currentAtsResult);
    navigator.clipboard.writeText(reportText).then(() => {
      showToast('Report copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy to clipboard.');
    });
  });

  /* ==========================================================================
     App Boot
     ========================================================================== */
  initTheme();
  // Pre-load default preset into inputs in background
  if (SAMPLE_PRESETS['fullstack']) {
    resumeInput.value = SAMPLE_PRESETS['fullstack'].resume;
    jdInput.value = SAMPLE_PRESETS['fullstack'].jd;
    updateInputMetrics();
    runAnalysis();
  }
  // Start on the Overview / Home Landing view with the Get Started button
  switchTab('home');

});
