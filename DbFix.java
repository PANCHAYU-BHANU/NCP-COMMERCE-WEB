import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DbFix {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ncp_com_db?serverTimezone=UTC", "root", "");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");
            System.out.println("Role column updated successfully.");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
