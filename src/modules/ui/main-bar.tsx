import { makeStyles } from "@saleor/macaw-ui";
import { ReactNode } from "react";
import { Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 96,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftColumn: {},
  rightColumn: {},
  appName: { fontSize: 24, margin: 0 },
  appAuthor: {
    fontSize: 12,
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    fontWeight: 500,
    margin: 0,
  },
}));

type Props = {
  name: string;
  author: string;
  rightColumnContent?: ReactNode;
};

export const MainBar = ({ name, author, rightColumnContent }: Props) => {
  const styles = useStyles();

  return (
    <Paper elevation={0} className={styles.root}>
      <div className={styles.leftColumn}>
        <h1 className={styles.appName}>{name}</h1>
        <h1 className={styles.appAuthor}>{author}</h1>
      </div>
      <div className={styles.rightColumn}>{rightColumnContent}</div>
    </Paper>
  );
};
