# genshin-impact-redeem-code
Automatically redeems genshin impact codes once a month



Add the 3 Secrets (ANCHOR_BROWSER_KEY, GENSHIN_EMAIL, GENSHIN_PASSWORD) to your GitHub Repository Settings -> Secrets and variables -> Actions.

Must put the 3 in REPOSITORY SECRETS (not environment secrets).


It will automatically run on the first of each month. to make it run more often or on a different date, edit the cron job in the .yaml file:
```
on:
  schedule:
    - cron: '0 0 1 * *'
```

to manually run it right now, Actions -> genshin impact -> run workflow