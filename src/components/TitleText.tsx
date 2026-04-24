import { StyleSheet, Text } from "react-native";

type Props = {
    title: string;
    description?: string;
};

const TitleText: React.FC<Props> = ({title,description}) => {
    return(
        <>
            <Text style={styles.title}>{title}</Text>
            {description ? (<Text style={styles.description}>{description}</Text> ):null }
        </>
    );
};

export default TitleText;

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#3B2F2F',
        marginBottom: 12,
    },
    description: {
    fontSize: 16,
    color: '#5C4B51',
    marginBottom: 24,
    lineHeight: 24,
  },
});