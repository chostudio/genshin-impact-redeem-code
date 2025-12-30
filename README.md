# genshin-impact-redeem-code
AI browser agent that automatically redeems genshin impact codes once a month

![Genshin-Impact-how-to-redeem-codes-3](https://github.com/user-attachments/assets/d676ec92-e03b-43dd-a00e-f4b8f070283b)

## Setup

Add the 3 Secrets (ANCHOR_BROWSER_KEY, GENSHIN_EMAIL, GENSHIN_PASSWORD) to your GitHub Repository Settings -> Secrets and variables -> Actions.

Must put the 3 in REPOSITORY SECRETS on GitHub (not environment secrets on GitHub).


It will automatically run on the first of each month. to make it run more often or on a different date, edit the cron job in the .yaml file:
```
on:
  schedule:
    - cron: '0 0 1 * *'
```

To manually run it at any moment, click the Actions tab at the top -> Monthly Genshin Code Redeemer tab in the sidebar -> run workflow button (gray dropdown) -> run workflow button (green button)
