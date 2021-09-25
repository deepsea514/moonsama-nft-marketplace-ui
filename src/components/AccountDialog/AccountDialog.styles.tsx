import { Theme } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

export const useStyles = makeStyles<Theme>((theme) => ({
  dialogContainer: {
    display: 'flex',
    padding: '0 32px 32px 32px',
    flexDirection: 'column',
  },
  button: {
    marginTop: '8px',
  },
  titleSlot: {
    display: 'block',
    marginBottom: '20px',
  },
  row: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'row',
    fontSize: '12px',
  },
  lowerSection: {
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: '1.5rem',
    flexGrow: 1,
    overflow: 'auto',
    background: '#1d1d1d',
    fontSize: '11px',

    '& > p': {
      fontSize: '12px',
    },
  },
  walletName: {
    width: 'initial',
    fontSize: '0.825rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  iconWrapper: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 8px 8px 0',
    '& > img': {},
    span: {
      height: '16px',
      width: '16px',
    },
  },
  flexCoumnNoWrap: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  linkStyledButton: {
    border: 'none',
    textDecoration: 'none',
    background: 'none',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    fontWeight: 500,
    ':hover': {
      textDecoration: 'underline',
    },
    ':focus': {
      outline: 'none',
      textDecoration: 'underline',
    },
    ':active': {
      textDecoration: 'none',
    },
  },
  autoRow: {
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  walletOption: {
    background: '#fff',
  },
  walletPendingText: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '12px',
  },
}));
