<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
			<head>
				<title>XML Sitemap | Frank Website SEO Checker &amp; Audit</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style type="text/css">
					:root {
						--primary: #6366f1;
						--primary-hover: #4f46e5;
						--primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
						--bg: #0f172a;
						--card-bg: #ffffff;
						--text-main: #1e293b;
						--text-muted: #64748b;
						--border: #e2e8f0;
						--row-hover: #f8fafc;
					}
					* {
						box-sizing: border-box;
					}
					body {
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
						color: var(--text-main);
						background-color: #f1f5f9;
						margin: 0;
						padding: 32px 16px 60px;
						line-height: 1.5;
					}
					.sitemap-wrapper {
						max-width: 1100px;
						margin: 0 auto;
						background: var(--card-bg);
						border: 1px solid var(--border);
						border-radius: 20px;
						box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
						overflow: hidden;
					}
					.sitemap-header {
						background: var(--primary-gradient);
						padding: 36px 40px;
						color: #ffffff;
					}
					.sitemap-header h1 {
						margin: 0 0 10px 0;
						font-size: 26px;
						font-weight: 800;
						letter-spacing: -0.03em;
						display: flex;
						align-items: center;
						gap: 12px;
					}
					.sitemap-header p {
						margin: 0;
						font-size: 14.5px;
						opacity: 0.95;
						max-width: 780px;
						line-height: 1.6;
					}
					.sitemap-header a {
						color: #ffffff;
						font-weight: 600;
						text-decoration: underline;
					}
					.breadcrumbs {
						margin-top: 18px;
						font-size: 13.5px;
						display: inline-flex;
						align-items: center;
						background: rgba(255, 255, 255, 0.16);
						padding: 6px 14px;
						border-radius: 9999px;
						backdrop-filter: blur(8px);
					}
					.breadcrumbs a {
						color: #ffffff;
						text-decoration: none;
						font-weight: 600;
					}
					.breadcrumbs a:hover {
						text-decoration: underline;
					}
					.sitemap-body {
						padding: 32px 40px;
					}
					.toolbar {
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						justify-content: space-between;
						gap: 16px;
						margin-bottom: 24px;
					}
					.stats-badge {
						display: inline-flex;
						align-items: center;
						gap: 6px;
						padding: 6px 14px;
						border-radius: 10px;
						font-weight: 700;
						font-size: 13px;
						background-color: #e0e7ff;
						color: #3730a3;
					}
					.search-input {
						padding: 10px 16px;
						border-radius: 10px;
						border: 1px solid var(--border);
						font-size: 13.5px;
						outline: none;
						min-width: 260px;
						transition: border-color 0.2s;
					}
					.search-input:focus {
						border-color: var(--primary);
						box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
					}
					.table-responsive {
						overflow-x: auto;
					}
					table {
						width: 100%;
						border-collapse: separate;
						border-spacing: 0;
						text-align: left;
					}
					th {
						font-size: 12px;
						font-weight: 700;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						color: var(--text-muted);
						border-bottom: 2px solid var(--border);
						padding: 14px 14px;
						background-color: #ffffff;
					}
					td {
						font-size: 13.5px;
						border-bottom: 1px solid #f1f5f9;
						padding: 14px 14px;
						vertical-align: middle;
					}
					tr:hover td {
						background-color: var(--row-hover);
					}
					tr:last-child td {
						border-bottom: none;
					}
					.url-link {
						color: var(--primary);
						text-decoration: none;
						font-weight: 600;
						word-break: break-all;
					}
					.url-link:hover {
						text-decoration: underline;
						color: var(--primary-hover);
					}
					.img-badge {
						display: inline-flex;
						align-items: center;
						gap: 4px;
						padding: 3px 8px;
						border-radius: 6px;
						font-size: 12px;
						font-weight: 600;
						background-color: #f1f5f9;
						color: #475569;
					}
					.img-badge.has-images {
						background-color: #ecfdf5;
						color: #065f46;
					}
					.date-text {
						color: #64748b;
						font-size: 13px;
						white-space: nowrap;
					}
					.pill {
						display: inline-block;
						padding: 2px 8px;
						border-radius: 9999px;
						font-size: 11.5px;
						font-weight: 600;
						background: #f1f5f9;
						color: #475569;
						text-align: center;
					}
					.footer-note {
						margin-top: 32px;
						padding-top: 20px;
						border-top: 1px solid var(--border);
						font-size: 12.5px;
						color: var(--text-muted);
						display: flex;
						justify-content: space-between;
						align-items: center;
						flex-wrap: wrap;
						gap: 12px;
					}
					.footer-note a {
						color: var(--primary);
						text-decoration: none;
						font-weight: 600;
					}
				</style>
			</head>
			<body>
				<div class="sitemap-wrapper">
					<div class="sitemap-header">
						<h1>
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
								<polyline points="2 17 12 22 22 17"></polyline>
								<polyline points="2 12 12 17 22 12"></polyline>
							</svg>
							XML Sitemap Index
						</h1>
						<p>
							This XML Sitemap is generated dynamically by <strong>Frank Website SEO Checker &amp; Audit</strong> to index website pages, images, and taxonomy terms with Google, Bing, and major search engines.
						</p>
						<xsl:if test="sitemap:urlset">
							<div class="breadcrumbs">
								<a href="sitemap_index.xml">&#8592; Back to Sitemap Index</a>
							</div>
						</xsl:if>
					</div>

					<div class="sitemap-body">
						<div class="toolbar">
							<xsl:if test="sitemap:sitemapindex">
								<div class="stats-badge">
									<span>Index File:</span>
									<strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> Sub-Sitemaps</strong>
								</div>
							</xsl:if>
							<xsl:if test="sitemap:urlset">
								<div class="stats-badge">
									<span>Total Entries:</span>
									<strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs</strong>
								</div>
							</xsl:if>

							<input type="text" id="sitemapFilter" class="search-input" placeholder="Filter URLs on this page..." onkeyup="filterSitemapTable()" />
						</div>

						<div class="table-responsive">
							<!-- SITEMAP INDEX TABLE -->
							<xsl:if test="sitemap:sitemapindex">
								<table id="sitemapTable">
									<thead>
										<tr>
											<th style="width: 70%;">Sitemap URL</th>
											<th style="width: 30%;">Last Modified</th>
										</tr>
									</thead>
									<tbody>
										<xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
											<tr>
												<td>
													<a class="url-link" href="{sitemap:loc}">
														<xsl:value-of select="sitemap:loc"/>
													</a>
												</td>
												<td class="date-text">
													<xsl:value-of select="sitemap:lastmod"/>
												</td>
											</tr>
										</xsl:for-each>
									</tbody>
								</table>
							</xsl:if>

							<!-- URLSET TABLE -->
							<xsl:if test="sitemap:urlset">
								<table id="sitemapTable">
									<thead>
										<tr>
											<th style="width: 55%;">URL Location</th>
											<th style="width: 12%;">Images</th>
											<th style="width: 18%;">Last Modified</th>
											<th style="width: 15%;">Changefreq</th>
										</tr>
									</thead>
									<tbody>
										<xsl:for-each select="sitemap:urlset/sitemap:url">
											<tr>
												<td>
													<a class="url-link" href="{sitemap:loc}" target="_blank" rel="noopener noreferrer">
														<xsl:value-of select="sitemap:loc"/>
													</a>
												</td>
												<td>
													<xsl:variable name="imgCount" select="count(image:image)"/>
													<xsl:choose>
														<xsl:when test="$imgCount &gt; 0">
															<span class="img-badge has-images">
																&#128247; <xsl:value-of select="$imgCount"/>
															</span>
														</xsl:when>
														<xsl:otherwise>
															<span class="img-badge">0</span>
														</xsl:otherwise>
													</xsl:choose>
												</td>
												<td class="date-text">
													<xsl:value-of select="sitemap:lastmod"/>
												</td>
												<td>
													<span class="pill">
														<xsl:value-of select="sitemap:changefreq"/>
													</span>
												</td>
											</tr>
										</xsl:for-each>
									</tbody>
								</table>
							</xsl:if>
						</div>

						<div class="footer-note">
							<div>
								Optimized by <strong>Frank Website SEO Checker &amp; Audit</strong>
							</div>
							<div>
								Standards compliant with <a href="https://www.sitemaps.org" target="_blank" rel="noopener noreferrer">sitemaps.org</a> protocols
							</div>
						</div>
					</div>
				</div>

				<script type="text/javascript">
					<![CDATA[
					function filterSitemapTable() {
						var input = document.getElementById("sitemapFilter");
						var filter = input.value.toLowerCase();
						var table = document.getElementById("sitemapTable");
						if (!table) return;
						var tr = table.getElementsByTagName("tr");
						for (var i = 1; i < tr.length; i++) {
							var td = tr[i].getElementsByTagName("td")[0];
							if (td) {
								var txtValue = td.textContent || td.innerText;
								if (txtValue.toLowerCase().indexOf(filter) > -1) {
									tr[i].style.display = "";
								} else {
									tr[i].style.display = "none";
								}
							}
						}
					}
					]]>
				</script>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
