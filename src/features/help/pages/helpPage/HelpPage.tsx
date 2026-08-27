import { useEffect, useMemo, useState } from 'react';
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import {
  HELP_ARTICLES,
  type HelpArticleId,
} from '@/features/help/lib/helpArticles';
import { usePermissions } from '@/hooks/usePermissions';
import { PageShell } from '@/layouts/pageShell/PageShell';

const BODY_KEYS = ['body1', 'body2', 'body3'] as const;

function articleIdFromHash(hash: string): HelpArticleId | null {
  const id = hash.replace(/^#/, '');
  if (HELP_ARTICLES.some((article) => article.id === id)) {
    return id as HelpArticleId;
  }
  return null;
}

export function HelpPage() {
  const { t } = useTranslation('help');
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions } = usePermissions();

  const visibleArticles = useMemo(
    () =>
      HELP_ARTICLES.filter(
        (article) =>
          article.permission === undefined ||
          permissions.includes(article.permission),
      ),
    [permissions],
  );

  const visibleIds = useMemo(
    () => new Set(visibleArticles.map((article) => article.id)),
    [visibleArticles],
  );

  const hashArticleId = articleIdFromHash(location.hash);
  const initialExpanded =
    hashArticleId && visibleArticles.some((a) => a.id === hashArticleId)
      ? hashArticleId
      : (visibleArticles[0]?.id ?? false);

  const [expanded, setExpanded] = useState<HelpArticleId | false>(
    initialExpanded,
  );

  useEffect(() => {
    const fromHash = articleIdFromHash(location.hash);
    if (fromHash && visibleArticles.some((a) => a.id === fromHash)) {
      setExpanded(fromHash);
      return;
    }
    setExpanded((current) => {
      if (current !== false && visibleArticles.some((a) => a.id === current)) {
        return current;
      }
      return visibleArticles[0]?.id ?? false;
    });
  }, [location.hash, visibleArticles]);

  function goToArticle(id: HelpArticleId) {
    setExpanded(id);
    navigate({ pathname: location.pathname, hash: id }, { replace: true });
  }

  return (
    <PageShell maxWidth="md">
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        <Box>
          <Typography variant="h5" component="h1">
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Box>
          {visibleArticles.map((article) => {
            const title = t(`articles.${article.id}.title`);
            const summary = t(`articles.${article.id}.summary`);
            const before = t(`articles.${article.id}.before`, {
              defaultValue: '',
            }).trim();
            const paragraphs = BODY_KEYS.map((key) =>
              t(`articles.${article.id}.${key}`, { defaultValue: '' }),
            ).filter((text) => text.trim().length > 0);
            const showNext =
              article.nextId !== undefined && visibleIds.has(article.nextId);

            return (
              <Accordion
                key={article.id}
                id={article.id}
                expanded={expanded === article.id}
                onChange={(_, isExpanded) => {
                  setExpanded(isExpanded ? article.id : false);
                }}
                disableGutters
                elevation={0}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${article.id}-content`}
                  id={`${article.id}-header`}
                >
                  <Box sx={{ pr: 1 }}>
                    <Typography variant="subtitle1" component="span">
                      {article.step !== undefined
                        ? `${t('stepLabel', { step: article.step })} · ${title}`
                        : title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                    >
                      {summary}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1.5} alignItems="flex-start">
                    {before ? (
                      <Typography variant="body2" color="text.secondary">
                        {before}
                      </Typography>
                    ) : null}
                    {paragraphs.map((text, index) => (
                      <Typography key={index} variant="body2">
                        {text}
                      </Typography>
                    ))}
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {article.to ? (
                        <Button
                          component={RouterLink}
                          to={article.to}
                          variant="outlined"
                          size="small"
                        >
                          {t(`articles.${article.id}.cta`)}
                        </Button>
                      ) : null}
                      {showNext && article.nextId ? (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            goToArticle(article.nextId!);
                          }}
                        >
                          {t(`articles.${article.id}.next`)}
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Stack>
    </PageShell>
  );
}
