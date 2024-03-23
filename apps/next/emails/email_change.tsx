import * as React from "react";
import * as styles from "./_components/styles";
import { EmailOtpType } from "@supabase/supabase-js";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const redirectTo = `/login`;
const type: EmailOtpType = "email_change";

const confirmationURL = `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=${type}&next=${redirectTo}`;

export default function Email() {
  return (
    <Html>
      <Head />
      <Preview>Configm email change</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Confirm email change</Heading>
          <Text
            style={styles.text}
          >{`Click below to confirm the update of your email from {{ .Email }} to {{ .NewEmail }}:`}</Text>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={confirmationURL}>
              Click here to confirm
            </Button>
          </Section>
          <Text
            style={{
              ...styles.text,
              color: "#71717A",
            }}
          >
            If you didn&apos;t request an email change, you can safely ignore
            this email.
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            <Link
              href="https://supabase-modules-docs.vercel.app"
              target="_blank"
              style={{ ...styles.link, color: "#71717A" }}
            >
              Supabase Modules
            </Link>
            <br />
            Build smarter with pre-built modules today
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
