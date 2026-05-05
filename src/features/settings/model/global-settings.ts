/**
 * Appliance-wide global configuration: HTTPS, LDAP, SAML, NTP, SMTP,
 * Logstash sinks, OpenVPN, Splunk, plus the multi-tenancy flag.
 *
 * The shape mirrors the wire because nothing on the client reads more
 * than `multiTenancy` today; doing field-level translation for the
 * other 100+ keys would be busywork. Only the few fields that are
 * actually consumed are translated. New consumers should add their
 * fields to the transform when they need them.
 */
export type GlobalSettings = {
  multiTenancy: boolean;
};
